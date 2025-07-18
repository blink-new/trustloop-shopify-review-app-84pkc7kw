import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface ModerationRequest {
  reviewId: string;
  reviewText: string;
  rating: number;
  geminiApiKey: string;
}

interface ModerationResult {
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number;
  isSpam: boolean;
  spamConfidence: number;
  suggestedAction: 'approve' | 'reject' | 'manual_review';
  reason: string;
  toxicity: number;
  language: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  try {
    const { reviewId, reviewText, rating, geminiApiKey }: ModerationRequest = await req.json();

    if (!reviewId || !reviewText || !geminiApiKey) {
      return new Response(JSON.stringify({ error: 'Missing required parameters' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Call Gemini AI for sentiment analysis and content moderation
    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Analyze this customer review for sentiment, spam detection, and toxicity. Provide a JSON response with the following format:

{
  "sentiment": "positive|negative|neutral",
  "confidence": 0.0-1.0,
  "isSpam": boolean,
  "spamConfidence": 0.0-1.0,
  "suggestedAction": "approve|reject|manual_review",
  "reason": "brief explanation",
  "toxicity": 0.0-1.0,
  "language": "detected language code"
}

Review text: "${reviewText}"
Rating: ${rating}/5 stars

Consider the following factors:
- Sentiment should match the star rating (5 stars = positive, 1-2 stars = negative, 3 stars = neutral)
- Spam indicators: generic text, repeated phrases, unrelated content, fake enthusiasm
- Toxicity: offensive language, inappropriate content, personal attacks
- Language: detect the primary language of the review`
          }]
        }],
        generationConfig: {
          temperature: 0.1,
          topK: 1,
          topP: 1,
          maxOutputTokens: 1000,
        },
      }),
    });

    if (!geminiResponse.ok) {
      throw new Error(`Gemini API error: ${geminiResponse.status}`);
    }

    const geminiData = await geminiResponse.json();
    const generatedText = geminiData.candidates[0].content.parts[0].text;

    // Parse the JSON response from Gemini
    let moderationResult: ModerationResult;
    try {
      // Extract JSON from the response (it might be wrapped in markdown)
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        moderationResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No valid JSON found in Gemini response');
      }
    } catch (parseError) {
      // Fallback to basic analysis if Gemini response is malformed
      moderationResult = {
        sentiment: rating >= 4 ? 'positive' : rating <= 2 ? 'negative' : 'neutral',
        confidence: 0.7,
        isSpam: false,
        spamConfidence: 0.1,
        suggestedAction: 'manual_review',
        reason: 'AI analysis failed, requires manual review',
        toxicity: 0.1,
        language: 'en'
      };
    }

    // Additional heuristic checks
    const wordCount = reviewText.split(/\s+/).length;
    const hasLinks = /https?:\/\//.test(reviewText);
    const hasEmail = /\S+@\S+\.\S+/.test(reviewText);
    const isVeryShort = wordCount < 3;
    const isVeryLong = wordCount > 500;

    // Adjust spam confidence based on heuristics
    if (hasLinks || hasEmail) {
      moderationResult.spamConfidence = Math.max(moderationResult.spamConfidence, 0.8);
      moderationResult.isSpam = true;
    }

    if (isVeryShort && rating === 5) {
      moderationResult.spamConfidence = Math.max(moderationResult.spamConfidence, 0.6);
    }

    // Final decision logic
    if (moderationResult.isSpam || moderationResult.spamConfidence > 0.7) {
      moderationResult.suggestedAction = 'reject';
      moderationResult.reason = 'Detected as spam';
    } else if (moderationResult.toxicity > 0.7) {
      moderationResult.suggestedAction = 'reject';
      moderationResult.reason = 'Contains toxic content';
    } else if (moderationResult.confidence < 0.5) {
      moderationResult.suggestedAction = 'manual_review';
      moderationResult.reason = 'Low confidence analysis';
    } else {
      moderationResult.suggestedAction = 'approve';
      moderationResult.reason = 'Passed automated moderation';
    }

    // Update review in database with moderation results
    const { error: updateError } = await supabase
      .from('reviews')
      .update({
        sentiment: moderationResult.sentiment,
        confidence_score: moderationResult.confidence,
        is_spam: moderationResult.isSpam,
        spam_confidence: moderationResult.spamConfidence,
        toxicity_score: moderationResult.toxicity,
        language: moderationResult.language,
        moderation_status: moderationResult.suggestedAction,
        moderation_reason: moderationResult.reason,
        moderated_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', reviewId);

    if (updateError) {
      console.error('Error updating review:', updateError);
      throw new Error('Failed to update review');
    }

    return new Response(JSON.stringify(moderationResult), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (error) {
    console.error('Review moderation error:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error' 
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
});
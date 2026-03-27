// // services/geminiScreeningService.js
// // Uses Google Gemini API to analyze resumes against job descriptions

// const axios = require('axios');

// // const GEMINI_API_URL = process.env.GEMINI_API_KEY
// const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent'

// /**
//  * Analyze a single resume against a job description using Gemini AI
//  * @param {string} jobDescription - Full job description text
//  * @param {object} candidate - { id, name, resumeText, profileHeadline, skills, experience, education }
//  * @returns {object} Screening result with score, strengths, gaps, recommendation
//  */
// async function analyzeResumeWithGemini(jobDescription, candidate) {
//   const prompt = `You are an expert HR recruiter and talent evaluator. Analyze the candidate's resume against the job description below.

// JOB DESCRIPTION:
// ${jobDescription}

// CANDIDATE NAME: ${candidate.name}
// ${candidate.profileHeadline ? `HEADLINE: ${candidate.profileHeadline}` : ''}
// ${candidate.skills?.length ? `SKILLS: ${candidate.skills.join(', ')}` : ''}
// ${candidate.experience?.length ? `EXPERIENCE:\n${candidate.experience.map(e => `- ${e.title} at ${e.company} (${e.duration || 'N/A'}): ${e.description || ''}`).join('\n')}` : ''}
// ${candidate.education?.length ? `EDUCATION:\n${candidate.education.map(e => `- ${e.degree} from ${e.institution} (${e.year || ''})`).join('\n')}` : ''}
// ${candidate.resumeText ? `RESUME TEXT:\n${candidate.resumeText}` : ''}

// Based on the above, provide your evaluation. Return ONLY a valid JSON object with NO markdown, NO backticks, NO extra text:
// {
//   "score": <integer between 0 and 100>,
//   "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
//   "gaps": ["<gap 1>", "<gap 2>", "<gap 3>"],
//   "recommendation": "<exactly one of: Strong Fit, Moderate Fit, Not Fit>",
//   "summary": "<one concise sentence explaining your recommendation>"
// }`;

//   const response = await axios.post(
//     `${GEMINI_API_URL}?key=${process.env.GEMINI_API_KEY}`,
//     {
//       contents: [{ parts: [{ text: prompt }] }],
//       generationConfig: {
//         temperature: 0.2,
//         maxOutputTokens: 1024,
//       },
//     },
//     { headers: { 'Content-Type': 'application/json' } }
//   );

//   const rawText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

//   // Strip any markdown code fences if Gemini adds them
//   const cleaned = rawText.replace(/```json|```/g, '').trim();

//   let parsed;
//   try {
//     parsed = JSON.parse(cleaned);
//   } catch {
//     // Fallback if JSON parse fails
//     parsed = {
//       score: 0,
//       strengths: ['Unable to analyze'],
//       gaps: ['Resume data insufficient'],
//       recommendation: 'Not Fit',
//       summary: 'Analysis could not be completed for this candidate.',
//     };
//   }

//   // Normalize and clamp
//   return {
//     score: Math.min(100, Math.max(0, parseInt(parsed.score) || 0)),
//     strengths: (parsed.strengths || []).slice(0, 3),
//     gaps: (parsed.gaps || []).slice(0, 3),
//     recommendation: ['Strong Fit', 'Moderate Fit', 'Not Fit'].includes(parsed.recommendation)
//       ? parsed.recommendation
//       : 'Not Fit',
//     summary: parsed.summary || '',
//   };
// }

// /**
//  * Screen multiple candidates for a job — runs in parallel for speed
//  * @param {string} jobDescription
//  * @param {Array} candidates - Array of candidate objects
//  * @returns {Array} Sorted, ranked screening results
//  */
// async function screenAllCandidates(jobDescription, candidates) {
//   // Run all Gemini calls concurrently
//   const promises = candidates.map(async (candidate) => {
//     try {
//       const result = await analyzeResumeWithGemini(jobDescription, candidate);
//       return {
//         candidateId: candidate.id,
//         candidateName: candidate.name,
//         email: candidate.email,
//         profileHeadline: candidate.profileHeadline,
//         ...result,
//       };
//     } catch (err) {
//       console.error(`Gemini error for candidate ${candidate.name}:`, err.message);
//       return {
//         candidateId: candidate.id,
//         candidateName: candidate.name,
//         email: candidate.email,
//         profileHeadline: candidate.profileHeadline,
//         score: 0,
//         strengths: ['Error during analysis'],
//         gaps: ['API error'],
//         recommendation: 'Not Fit',
//         summary: 'An error occurred while analyzing this resume.',
//       };
//     }
//   });

//   const results = await Promise.all(promises);

//   // Sort by score descending, assign ranks
//   results.sort((a, b) => b.score - a.score);
//   results.forEach((r, i) => {
//     r.rank = i + 1;
//   });

//   return results;
// }

// module.exports = { screenAllCandidates, analyzeResumeWithGemini };




// server/geminiScreeningService.js
// const axios = require('axios');

// // ── FIX 1: GEMINI_API_URL must be the endpoint URL, not the key ──
// const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

// async function analyzeResumeWithGemini(jobDescription, candidate) {

//   // ── FIX 2: skills/experience/education are Strings in this project ──
//   // Do NOT call .join() or .map() on them — they are plain text already
//   const prompt = `You are an expert HR recruiter and talent evaluator. Analyze the candidate's resume against the job description below.

// JOB DESCRIPTION:
// ${jobDescription}

// CANDIDATE NAME: ${candidate.name}
// ${candidate.skills    ? `SKILLS: ${candidate.skills}`         : ''}
// ${candidate.experience ? `EXPERIENCE: ${candidate.experience}` : ''}
// ${candidate.education  ? `EDUCATION: ${candidate.education}`   : ''}
// ${candidate.resumeText ? `RESUME TEXT: ${candidate.resumeText}` : ''}

// Based on the above, provide your evaluation. Return ONLY a valid JSON object with NO markdown, NO backticks, NO extra text:
// {
//   "score": <integer between 0 and 100>,
//   "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
//   "gaps": ["<gap 1>", "<gap 2>", "<gap 3>"],
//   "recommendation": "<exactly one of: Strong Fit, Moderate Fit, Not Fit>",
//   "summary": "<one concise sentence explaining your recommendation>"
// }`;

//   // ── FIX 3: key goes in query param, URL is the endpoint ──
//   const response = await axios.post(
//     `${GEMINI_API_URL}?key=${process.env.GEMINI_API_KEY}`,
//     {
//       contents: [{ parts: [{ text: prompt }] }],
//       generationConfig: {
//         temperature: 0.2,
//         maxOutputTokens: 1024,
//       },
//     },
//     { headers: { 'Content-Type': 'application/json' } }
//   );

//   const rawText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
//   const cleaned = rawText.replace(/```json|```/g, '').trim();

//   let parsed;
//   try {
//     parsed = JSON.parse(cleaned);
//   } catch {
//     parsed = {
//       score: 0,
//       strengths: ['Unable to analyze'],
//       gaps: ['Resume data insufficient'],
//       recommendation: 'Not Fit',
//       summary: 'Analysis could not be completed for this candidate.',
//     };
//   }

//   return {
//     score: Math.min(100, Math.max(0, parseInt(parsed.score) || 0)),
//     strengths: (parsed.strengths || []).slice(0, 3),
//     gaps:      (parsed.gaps || []).slice(0, 3),
//     recommendation: ['Strong Fit', 'Moderate Fit', 'Not Fit'].includes(parsed.recommendation)
//       ? parsed.recommendation
//       : 'Not Fit',
//     summary: parsed.summary || '',
//   };
// }

// async function screenAllCandidates(jobDescription, candidates) {
//   const promises = candidates.map(async (candidate) => {
//     try {
//       const result = await analyzeResumeWithGemini(jobDescription, candidate);
//       return {
//         candidateId:   candidate.id,
//         candidateName: candidate.name,
//         email:         candidate.email,
//         ...result,
//       };
//     } catch (err) {
//       // ── FIX 4: log the FULL error so you can see exactly what Gemini returns ──
//       console.error(`Gemini error for ${candidate.name}:`, err.response?.data || err.message);
//       return {
//         candidateId:   candidate.id,
//         candidateName: candidate.name,
//         email:         candidate.email,
//         score: 0,
//         strengths:     ['Error during analysis'],
//         gaps:          ['API error'],
//         recommendation: 'Not Fit',
//         summary: 'An error occurred while analyzing this resume.',
//       };
//     }
//   });

//   const results = await Promise.all(promises);

//   results.sort((a, b) => b.score - a.score);
//   results.forEach((r, i) => { r.rank = i + 1; });

//   return results;
// }

// module.exports = { screenAllCandidates, analyzeResumeWithGemini };




// services/geminiScreeningService.js

const axios = require('axios');

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

async function analyzeResumeWithGemini(jobDescription, candidate) {

  // skills, experience, education are plain STRINGS in this project — not arrays
  // Do NOT use .join() or .map() on them
  const prompt = `You are an expert HR recruiter and talent evaluator. Analyze the candidate resume against the job description and return a structured evaluation.

JOB DESCRIPTION:
${jobDescription}

CANDIDATE NAME: ${candidate.name}
${candidate.skills     ? `SKILLS: ${candidate.skills}`          : 'SKILLS: Not provided'}
${candidate.experience ? `EXPERIENCE: ${candidate.experience}`  : 'EXPERIENCE: Not provided'}
${candidate.education  ? `EDUCATION: ${candidate.education}`    : 'EDUCATION: Not provided'}
${candidate.resumeText ? `RESUME: ${candidate.resumeText}`      : ''}

Return ONLY a valid JSON object — no markdown, no backticks, no explanation before or after:
{
  "score": <integer 0-100, how well candidate matches the job>,
  "strengths": ["<specific strength 1>", "<specific strength 2>", "<specific strength 3>"],
  "gaps": ["<specific gap 1>", "<specific gap 2>", "<specific gap 3>"],
  "recommendation": "<exactly one of: Strong Fit, Moderate Fit, Not Fit>",
  "summary": "<one sentence explaining the recommendation>"
}`;

  const response = await axios.post(
    `${GEMINI_API_URL}?key=${process.env.GEMINI_API_KEY}`,
    {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 1024,
      },
    },
    { headers: { 'Content-Type': 'application/json' } }
  );

  const rawText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

  // Strip markdown code fences if Gemini wraps the JSON
  const cleaned = rawText.replace(/```json|```/g, '').trim();

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch (e) {
    console.error('JSON parse failed. Raw Gemini response was:', rawText);
    parsed = {
      score: 0,
      strengths: ['Unable to parse Gemini response'],
      gaps: ['JSON parse error'],
      recommendation: 'Not Fit',
      summary: 'Could not parse the AI response.',
    };
  }

  return {
    score: Math.min(100, Math.max(0, parseInt(parsed.score) || 0)),
    strengths:      (parsed.strengths || []).slice(0, 3),
    gaps:           (parsed.gaps || []).slice(0, 3),
    recommendation: ['Strong Fit', 'Moderate Fit', 'Not Fit'].includes(parsed.recommendation)
      ? parsed.recommendation
      : 'Not Fit',
    summary: parsed.summary || '',
  };
}

async function screenAllCandidates(jobDescription, candidates) {
  const promises = candidates.map(async (candidate) => {
    try {
      const result = await analyzeResumeWithGemini(jobDescription, candidate);
      return {
        candidateId:   candidate.id,
        candidateName: candidate.name,
        email:         candidate.email,
        ...result,
      };
    } catch (err) {
      // Log full Gemini error so you can debug it in terminal
      console.error(
        `Gemini error for ${candidate.name}:`,
        err.response?.data || err.message
      );
      return {
        candidateId:   candidate.id,
        candidateName: candidate.name,
        email:         candidate.email,
        score: 0,
        strengths:     ['Error during analysis'],
        gaps:          ['API error — check terminal logs'],
        recommendation: 'Not Fit',
        summary:       'Gemini API call failed. Check server terminal for details.',
      };
    }
  });

  const results = await Promise.all(promises);

  results.sort((a, b) => b.score - a.score);
  results.forEach((r, i) => { r.rank = i + 1; });

  return results;
}

module.exports = { screenAllCandidates, analyzeResumeWithGemini };
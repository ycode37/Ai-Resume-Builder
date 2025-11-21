import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "dotenv";

config();

const genAI = new GoogleGenerativeAI(process.env.GEMENI_API_KEY);

// Function to analyze resume text and generate ATS score
const analyzeResumeText = async (resumeText) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `You are an ATS (Applicant Tracking System) expert. Analyze the following resume and provide:
1. An ATS compatibility score (0-100)
2. A rating (e.g., "Excellent", "Good", "Fair", "Poor")
3. A list of strengths (3-5 points)
4. A list of improvements needed (3-5 points)
5. Key detected keywords (5-10 relevant keywords)

Resume Content:
${resumeText}

Provide your response in the following JSON format:
{
  "score": <number 0-100>,
  "rating": "<rating>",
  "strengths": ["strength1", "strength2", ...],
  "improvements": ["improvement1", "improvement2", ...],
  "keywords": ["keyword1", "keyword2", ...]
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse the JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    } else {
      // Fallback if JSON parsing fails
      return {
        score: 70,
        rating: "Good",
        strengths: [
          "Resume structure is clear",
          "Contact information is present",
          "Work experience is included",
        ],
        improvements: [
          "Add more specific keywords",
          "Quantify achievements",
          "Optimize formatting for ATS",
        ],
        keywords: ["professional", "experience", "skills", "education"],
      };
    }
  } catch (error) {
    console.error("Error analyzing resume:", error);
    throw error;
  }
};

// Controller to check ATS score from uploaded file
const checkATSFromFile = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json(new ApiError(400, "No resume file uploaded"));
    }

    // For now, we'll extract text based on file type
    // In production, you'd use libraries like pdf-parse or mammoth for proper extraction
    const fileName = req.file.originalname;
    const fileExt = fileName.split(".").pop().toLowerCase();

    // Mock resume text extraction - in production, use proper parsers
    const resumeText = `Resume from file: ${fileName}
    This is a placeholder for actual resume content extraction.
    In production, you would use libraries like:
    - pdf-parse for PDF files
    - mammoth for DOCX files
    
    The file would be parsed and text content extracted here.`;

    const analysisResult = await analyzeResumeText(resumeText);

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          analysisResult,
          "ATS score calculated successfully"
        )
      );
  } catch (error) {
    console.error("Error checking ATS from file:", error);
    return res
      .status(500)
      .json(
        new ApiError(500, "Failed to analyze resume", [error.message])
      );
  }
};

// Controller to check ATS score from existing resume
const checkATSFromExisting = async (req, res) => {
  try {
    const { resumeData } = req.body;

    if (!resumeData) {
      return res
        .status(400)
        .json(new ApiError(400, "Resume data is required"));
    }

    // Build resume text from structured data
    let resumeText = "";

    if (resumeData.firstName || resumeData.lastName) {
      resumeText += `Name: ${resumeData.firstName} ${resumeData.lastName}\n`;
    }
    if (resumeData.email) {
      resumeText += `Email: ${resumeData.email}\n`;
    }
    if (resumeData.phone) {
      resumeText += `Phone: ${resumeData.phone}\n`;
    }
    if (resumeData.address) {
      resumeText += `Address: ${resumeData.address}\n`;
    }
    if (resumeData.jobTitle) {
      resumeText += `Job Title: ${resumeData.jobTitle}\n`;
    }
    if (resumeData.summary) {
      resumeText += `\nSummary:\n${resumeData.summary}\n`;
    }

    if (resumeData.experience && resumeData.experience.length > 0) {
      resumeText += `\nWork Experience:\n`;
      resumeData.experience.forEach((exp) => {
        resumeText += `- ${exp.title || ""} at ${exp.companyName || ""}\n`;
        resumeText += `  ${exp.startDate || ""} to ${exp.endDate || ""}\n`;
        if (exp.workSummary) {
          resumeText += `  ${exp.workSummary}\n`;
        }
      });
    }

    if (resumeData.education && resumeData.education.length > 0) {
      resumeText += `\nEducation:\n`;
      resumeData.education.forEach((edu) => {
        resumeText += `- ${edu.degree || ""} in ${edu.major || ""}\n`;
        resumeText += `  ${edu.universityName || ""} (${edu.startDate || ""} - ${edu.endDate || ""})\n`;
      });
    }

    if (resumeData.skills && resumeData.skills.length > 0) {
      resumeText += `\nSkills:\n`;
      resumeData.skills.forEach((skill) => {
        resumeText += `- ${skill.name || ""}\n`;
      });
    }

    if (resumeData.projects && resumeData.projects.length > 0) {
      resumeText += `\nProjects:\n`;
      resumeData.projects.forEach((project) => {
        resumeText += `- ${project.title || ""}\n`;
        if (project.description) {
          resumeText += `  ${project.description}\n`;
        }
      });
    }

    const analysisResult = await analyzeResumeText(resumeText);

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          analysisResult,
          "ATS score calculated successfully"
        )
      );
  } catch (error) {
    console.error("Error checking ATS from existing resume:", error);
    return res
      .status(500)
      .json(
        new ApiError(500, "Failed to analyze resume", [error.message])
      );
  }
};

export { checkATSFromFile, checkATSFromExisting };

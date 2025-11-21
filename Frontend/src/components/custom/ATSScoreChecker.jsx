import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Upload, FileText, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { checkATSScore } from "@/Services/atsService";
import { toast } from "sonner";

function ATSScoreChecker({ userResumes = [] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedResume, setSelectedResume] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [atsResult, setAtsResult] = useState(null);
  const [uploadSource, setUploadSource] = useState("file"); // 'file' or 'existing'

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const validTypes = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
      if (validTypes.includes(file.type)) {
        setSelectedFile(file);
        setSelectedResume(null);
        setAtsResult(null);
      } else {
        toast.error("Please upload a PDF or DOCX file");
      }
    }
  };

  const handleResumeSelect = (resume) => {
    setSelectedResume(resume);
    setSelectedFile(null);
    setAtsResult(null);
  };

  const handleAnalyze = async () => {
    if (!selectedFile && !selectedResume) {
      toast.error("Please select a resume to analyze");
      return;
    }

    setIsAnalyzing(true);
    setAtsResult(null);

    try {
      // Simulate 10-second hold
      await new Promise((resolve) => setTimeout(resolve, 10000));

      let result;
      if (selectedFile) {
        result = await checkATSScore(selectedFile, "file");
      } else {
        result = await checkATSScore(selectedResume, "existing");
      }

      setAtsResult(result);
      toast.success("ATS Analysis Complete!");
    } catch (error) {
      toast.error(error.message || "Failed to analyze resume");
      console.error("ATS Analysis Error:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetAnalysis = () => {
    setSelectedFile(null);
    setSelectedResume(null);
    setAtsResult(null);
    setIsAnalyzing(false);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBgColor = (score) => {
    if (score >= 80) return "bg-green-100";
    if (score >= 60) return "bg-yellow-100";
    return "bg-red-100";
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) resetAnalysis();
    }}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <FileText className="w-4 h-4" />
          ATS Score Checker
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>ATS Score Checker</DialogTitle>
          <DialogDescription>
            Upload your resume or select from existing ones to check your ATS compatibility score
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Source Selection */}
          <div className="flex gap-4">
            <Button
              variant={uploadSource === "file" ? "default" : "outline"}
              onClick={() => {
                setUploadSource("file");
                setSelectedResume(null);
              }}
              className="flex-1"
            >
              Upload from PC
            </Button>
            <Button
              variant={uploadSource === "existing" ? "default" : "outline"}
              onClick={() => {
                setUploadSource("existing");
                setSelectedFile(null);
              }}
              className="flex-1"
            >
              Select Existing Resume
            </Button>
          </div>

          {/* File Upload Section */}
          {uploadSource === "file" && (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
              <input
                type="file"
                accept=".pdf,.docx"
                onChange={handleFileChange}
                className="hidden"
                id="resume-upload"
              />
              <label htmlFor="resume-upload" className="cursor-pointer">
                <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-sm text-gray-600 mb-2">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-gray-400">PDF or DOCX (Max 5MB)</p>
              </label>
              {selectedFile && (
                <div className="mt-4 flex items-center justify-center gap-2 text-sm text-green-600">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{selectedFile.name}</span>
                </div>
              )}
            </div>
          )}

          {/* Existing Resume Selection */}
          {uploadSource === "existing" && (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {userResumes && userResumes.length > 0 ? (
                userResumes.map((resume) => (
                  <div
                    key={resume._id}
                    onClick={() => handleResumeSelect(resume)}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedResume?._id === resume._id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="font-medium">{resume.title || "Untitled Resume"}</p>
                        <p className="text-xs text-gray-500">
                          {resume.firstName} {resume.lastName}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No resumes found. Create one first!</p>
                </div>
              )}
            </div>
          )}

          {/* Analyze Button */}
          <Button
            onClick={handleAnalyze}
            disabled={isAnalyzing || (!selectedFile && !selectedResume)}
            className="w-full"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing... Please wait
              </>
            ) : (
              "Analyze Resume"
            )}
          </Button>

          {/* Results Section */}
          {atsResult && (
            <div className="space-y-4 animate-in fade-in duration-500">
              <div className={`rounded-lg p-6 ${getScoreBgColor(atsResult.score)}`}>
                <div className="text-center">
                  <p className="text-sm font-medium mb-2">ATS Compatibility Score</p>
                  <p className={`text-6xl font-bold ${getScoreColor(atsResult.score)}`}>
                    {atsResult.score}
                  </p>
                  <p className="text-sm mt-2 text-gray-600">{atsResult.rating}</p>
                </div>
              </div>

              {/* Strengths */}
              {atsResult.strengths && atsResult.strengths.length > 0 && (
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-medium text-green-900 mb-2">Strengths</h4>
                      <ul className="space-y-1 text-sm text-green-800">
                        {atsResult.strengths.map((strength, index) => (
                          <li key={index}>• {strength}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Improvements */}
              {atsResult.improvements && atsResult.improvements.length > 0 && (
                <div className="bg-orange-50 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-medium text-orange-900 mb-2">Areas for Improvement</h4>
                      <ul className="space-y-1 text-sm text-orange-800">
                        {atsResult.improvements.map((improvement, index) => (
                          <li key={index}>• {improvement}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Keywords */}
              {atsResult.keywords && atsResult.keywords.length > 0 && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">Detected Keywords</h4>
                  <div className="flex flex-wrap gap-2">
                    {atsResult.keywords.map((keyword, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <Button onClick={resetAnalysis} variant="outline" className="w-full">
                Analyze Another Resume
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ATSScoreChecker;

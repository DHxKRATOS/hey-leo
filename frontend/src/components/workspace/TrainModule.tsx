import {
  AlertCircle,
  CheckCircle2,
  Edit3,
  Loader2,
  MessageSquare,
  Plus,
  RotateCcw,
  Save,
  Send,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import React, { useRef, useState } from "react";
import { toast } from "sonner@2.0.3";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Progress } from "../ui/progress";
import { ScrollArea } from "../ui/scroll-area";
import { Separator } from "../ui/separator";
import { Textarea } from "../ui/textarea";
import cardApi, {
  TrainingDocument,
  TrainingQAPair,
  TrainingWebsiteLink,
} from "../../api/cardApi";
import { useAppSelector } from "../../hooks";

interface TrainModuleProps {
  userId?: string;
  onSave?: (trainingData: any) => void;
  className?: string;
}

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  status: "uploading" | "processing" | "ready" | "error";
  progress?: number;
}

interface WebsiteLink {
  id: string;
  url: string;
  status: "crawling" | "ready" | "error";
  title?: string;
  favicon?: string;
}

interface QAPair {
  id: string;
  question: string;
  answer: string;
  createdAt: Date;
}

export function TrainModule({ className = "" }: TrainModuleProps) {
  // File upload state
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Website links state
  const [websiteLinks, setWebsiteLinks] = useState<WebsiteLink[]>([]);
  const [newWebsiteUrl, setNewWebsiteUrl] = useState("");

  // Q&A pairs state
  const [qaPairs, setQAPairs] = useState<QAPair[]>([]);
  const [isQAModalOpen, setIsQAModalOpen] = useState(false);
  const [editingQA, setEditingQA] = useState<QAPair | null>(null);
  const [qaForm, setQAForm] = useState({ question: "", answer: "" });

  // Free text knowledge state
  const [freeTextKnowledge, setFreeTextKnowledge] = useState("");
  const [isAutoSaving, setIsAutoSaving] = useState(false);

  // Test chat state
  const [testMessages, setTestMessages] = useState([
    {
      id: "1",
      type: "ai" as const,
      content:
        "Welcome! I'm your AI assistant. Ask me anything about your business, services, or experience.",
      timestamp: new Date(),
    },
  ]);
  const [testInput, setTestInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // Master training data state
  const [trainingData, setTrainingData] = useState<{
    training_documents: TrainingDocument[];
    training_website_links: TrainingWebsiteLink[];
    training_qa_pairs: TrainingQAPair[];
    training_free_text: string;
  }>({
    training_documents: [],
    training_website_links: [],
    training_qa_pairs: [],
    training_free_text: "",
  });

  const { currentCard } = useAppSelector((state) => state.cards);

  // Helper to persist merged state
  const saveTrainingData = async (newData: Partial<typeof trainingData>) => {
    const merged = { ...trainingData, ...newData };
    setTrainingData(merged);

    try {
      // await cardApi.updateTrainingData(currentCard.id, merged);
      toast.success("Training data updated!");
    } catch (err) {
      console.error("Failed to update training data", err);
      toast.error("Failed to update training data");
    }
  };

  // Initialize state from card
  React.useEffect(() => {
    if (currentCard) {
      setTrainingData({
        training_documents: currentCard.training_documents || [],
        training_website_links: currentCard.training_website_links || [],
        training_qa_pairs: currentCard.training_qa_pairs || [],
        training_free_text: currentCard.training_free_text || "",
      });
    }
  }, [currentCard]);
  // Suggested questions for testing
  const suggestedQuestions = [
    "What services do you offer?",
    "Tell me about your experience",
    "How can I contact you?",
    "What's your background?",
    "Do you offer consultations?",
  ];

  // File upload handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    handleFileUpload(files);
  };

  const handleFileUpload = async (files: File[]) => {
    if (uploadedFiles.length + files.length > 10) {
      toast.error("Maximum 10 files allowed");
      return;
    }

    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Maximum 10MB per file.`);
        continue;
      }

      const supportedTypes = [".pdf", ".doc", ".docx", ".txt"];
      const fileExtension = file.name
        .toLowerCase()
        .substring(file.name.lastIndexOf("."));

      if (!supportedTypes.includes(fileExtension)) {
        toast.error(
          `${file.name} format not supported. Use PDF, DOC, DOCX, or TXT.`
        );
        continue;
      }

      const newFile: UploadedFile = {
        id: Date.now().toString() + Math.random(),
        name: file.name,
        size: file.size,
        type: fileExtension,
        status: "uploading",
        progress: 0,
      };

      setUploadedFiles((prev) => [...prev, newFile]);

      try {
        // Actual API call with this file
        const response = await cardApi.uploadTrainingDocuments(
          currentCard?.user?.id,
          [file]
        );

        // Assume backend returns updated documents list
        await saveTrainingData({
          training_documents: response.training_documents,
        });
        // Mark file as ready
        setUploadedFiles((prev) =>
          prev.map((f) =>
            f.id === newFile.id ? { ...f, status: "ready", progress: 100 } : f
          )
        );

        toast.success(`${file.name} uploaded successfully!`);
      } catch (error) {
        console.error("Upload failed:", error);

        setUploadedFiles((prev) =>
          prev.map((f) =>
            f.id === newFile.id ? { ...f, status: "error", progress: 0 } : f
          )
        );

        toast.error(`Failed to upload ${file.name}`);
      }
    }
  };

  const removeFile = (id: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  // training_qa_pairs
  React.useEffect(() => {
    if (currentCard) {
      setWebsiteLinks(currentCard?.training_website_links);
      setQAPairs(currentCard?.training_qa_pairs);
      setFreeTextKnowledge(currentCard?.training_free_text);
      setUploadedFiles(currentCard?.training_documents);
    }
  }, [currentCard]);
  // Website link handlers
  const addWebsiteLink = async () => {
    if (!newWebsiteUrl.trim()) return;

    if (websiteLinks.length >= 5) {
      toast.error("Maximum 5 URLs allowed");
      return;
    }

    try {
      const url = new URL(
        newWebsiteUrl.startsWith("http")
          ? newWebsiteUrl
          : `https://${newWebsiteUrl}`
      );

      const newLink: TrainingWebsiteLink = {
        id: Date.now().toString(),
        url: url.href,
        addedAt: new Date(),
      };

      const updatedLinks = [...websiteLinks, newLink];
      setWebsiteLinks(updatedLinks);
      setNewWebsiteUrl("");

      let payload = {
        user_id: String(currentCard?.user?.id),
        url: url.href,
      };
      // await saveTrainingData({ training_website_links: updatedLinks });
      const response = await cardApi.uploadWebsiteLinks(payload);

      toast.success("Website link added successfully!");
    } catch {
      toast.error("Please enter a valid URL");
    }
  };

  const removeWebsiteLink = async (id: string) => {
    setWebsiteLinks((prev) => prev.filter((link) => link.id !== id));

    const updatedLinks = trainingData.training_website_links.filter(
      (link) => link.id !== id
    );
    await saveTrainingData({ training_website_links: updatedLinks });
  };

  // Q&A handlers
  const openQAModal = (qa?: QAPair) => {
    if (qa) {
      setEditingQA(qa);
      setQAForm({ question: qa.question, answer: qa.answer });
    } else {
      setEditingQA(null);
      setQAForm({ question: "", answer: "" });
    }
    setIsQAModalOpen(true);
  };

  const saveQA = async () => {
    if (!qaForm.question.trim() || !qaForm.answer.trim()) {
      toast.error("Please fill in both question and answer");
      return;
    }

    let updatedQAs: TrainingQAPair[];

    if (editingQA) {
      updatedQAs = qaPairs.map((qa) =>
        qa.id === editingQA.id
          ? { ...qa, question: qaForm.question, answer: qaForm.answer }
          : qa
      );

      setQAPairs(updatedQAs);
      toast.success("Q&A updated successfully!");
    } else {
      const newQA: TrainingQAPair = {
        id: Date.now().toString(),
        question: qaForm.question,
        answer: qaForm.answer,
        addedAt: new Date(),
      };
      updatedQAs = [...qaPairs, newQA];
      setQAPairs(updatedQAs);
      toast.success("Q&A added successfully!");
    }

    await saveTrainingData({ training_qa_pairs: updatedQAs });

    const { question, answer } = qaForm;
    let payload = {
      question,
      answer,
      user_id: String(currentCard?.user?.id),
    };

    const response = await cardApi.uploadQaPairs(payload);

    setIsQAModalOpen(false);
    setQAForm({ question: "", answer: "" });
    setEditingQA(null);
  };

  const removeQA = async (id: string) => {
    setQAPairs((prev) => prev.filter((qa) => qa.id !== id));
    const updatedQAs = trainingData.training_qa_pairs.filter(
      (qa) => qa.id !== id
    );
    await saveTrainingData({ training_qa_pairs: updatedQAs });
  };

  // Auto-save for free text
  React.useEffect(() => {
    if (freeTextKnowledge?.trim()) {
      setIsAutoSaving(true);
      const timer = setTimeout(() => {
        setIsAutoSaving(false);
        // Simulate save
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [freeTextKnowledge]);

  const saveFreeText = async (text: string) => {
    let payload = {
      text,
      user_id: String(currentCard?.user?.id),
    };
    // await saveTrainingData({ training_website_links: updatedLinks });
    const response = await cardApi.uploadAdditionalInformation(payload);
    await saveTrainingData({ training_free_text: text });
  };

  // Test chat handlers
  const sendTestMessage = async () => {
    if (!testInput.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      type: "user" as const,
      content: testInput,
      timestamp: new Date(),
    };

    setTestMessages((prev) => [...prev, userMessage]);
    setTestInput("");
    setIsTyping(true);

    let payload = {
      query: testInput,
      user_id: String(currentCard?.user?.id),
    };
    // await saveTrainingData({ training_website_links: updatedLinks });
    const response = await cardApi.sendChatMsg(payload);
    // Persist free text
    // saveFreeText(testInput);

    // Simulate AI response
    if (response) {
      setTimeout(() => {
        const aiResponse = {
          id: (Date.now() + 1).toString(),
          type: "ai" as const,
          content: response?.answer,
          timestamp: new Date(),
          confidence: 0,
        };
        setTestMessages((prev) => [...prev, aiResponse]);
        setIsTyping(false);
      }, 1500);
    }
  };

  const resetTestChat = () => {
    setTestMessages([
      {
        id: "1",
        type: "ai",
        content:
          "Welcome! I'm your AI assistant. Ask me anything about your business, services, or experience.",
        timestamp: new Date(),
      },
    ]);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case ".pdf":
        return "📄";
      case ".doc":
      case ".docx":
        return "📝";
      case ".txt":
        return "📃";
      default:
        return "📄";
    }
  };

  return (
    <div className={`h-full flex bg-background relative ${className}`}>
      {/* Leo Platform Branding - Workspace Module */}
      <div className="fixed bottom-4 left-4 z-30 pointer-events-none">
        <div className="bg-surface/80 backdrop-blur-sm border border-border/50 rounded-lg px-3 py-2 shadow-sm">
          <p className="text-xs text-text-tertiary font-medium flex items-center gap-1.5">
            <span className="text-primary">🦁</span>
            Train • <span className="text-primary font-semibold">leo</span>
          </p>
        </div>
      </div>

      {/* Knowledge Builder Panel - Left 60% */}
      <div className="flex-1 w-3/5 border-r border-border flex flex-col">
        <div className="shrink-0 p-6 border-b border-border bg-surface">
          <h2 className="text-lg font-semibold text-text-primary">
            Knowledge Builder
          </h2>
          <p className="text-sm text-text-secondary mt-1">
            Build your AI assistant's knowledge base
          </p>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-6 space-y-8">
            {/* Document Upload Section */}
            <div>
              <div className="mb-4">
                <h3 className="font-semibold text-text-primary">
                  Upload Documents
                </h3>
                <p className="text-sm text-text-secondary mt-1">
                  Add documents about your business, products, or services (Max
                  10 files)
                </p>
              </div>

              {/* Drag-drop zone */}
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  isDragging
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-border-hover"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <Upload className="w-8 h-8 mx-auto mb-4 text-text-tertiary" />
                <p className="text-sm text-text-primary mb-2">
                  Drag and drop files here, or{" "}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-primary hover:underline"
                  >
                    browse
                  </button>
                </p>
                <p className="text-xs text-text-tertiary">
                  Supports PDF, DOC, DOCX, TXT • Max 10MB per file
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={(e) =>
                    e.target.files &&
                    handleFileUpload(Array.from(e.target.files))
                  }
                  className="hidden"
                />
              </div>

              {/* File list */}
              {uploadedFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-text-secondary">
                      {uploadedFiles.length}/10 documents
                    </span>
                  </div>
                  {uploadedFiles.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center gap-3 p-3 bg-muted rounded-lg"
                    >
                      <span className="text-lg">{getFileIcon(file.type)}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text-primary truncate">
                          {file.name}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-text-tertiary">
                            {formatFileSize(file.size)}
                          </span>
                          <span className="text-xs">•</span>
                          {file.status === "uploading" && (
                            <div className="flex items-center gap-2">
                              <Progress
                                value={file.progress || 0}
                                className="w-20 h-1"
                              />
                              <span className="text-xs text-text-secondary">
                                Uploading...
                              </span>
                            </div>
                          )}
                          {file.status === "processing" && (
                            <div className="flex items-center gap-1">
                              <Loader2 className="w-3 h-3 animate-spin text-warning" />
                              <span className="text-xs text-warning">
                                Processing
                              </span>
                            </div>
                          )}
                          {file.status === "ready" && (
                            <div className="flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-success" />
                              <span className="text-xs text-success">
                                Ready
                              </span>
                            </div>
                          )}
                          {file.status === "error" && (
                            <div className="flex items-center gap-1">
                              <AlertCircle className="w-3 h-3 text-error" />
                              <span className="text-xs text-error">Error</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(file.id)}
                        className="p-1"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Separator />

            {/* Website Links Section */}
            <div>
              <div className="mb-4">
                <h3 className="font-semibold text-text-primary">
                  Add Website Links
                </h3>
                <p className="text-sm text-text-secondary mt-1">
                  We'll extract information from the main page only
                </p>
              </div>

              <div className="flex gap-2 mb-4">
                <Input
                  value={newWebsiteUrl}
                  onChange={(e) => setNewWebsiteUrl(e.target.value)}
                  placeholder="https://example.com"
                  onKeyDown={(e) => e.key === "Enter" && addWebsiteLink()}
                />
                <Button
                  variant="leo-primary"
                  onClick={addWebsiteLink}
                  disabled={websiteLinks.length >= 5}
                >
                  Add
                </Button>
              </div>

              {websiteLinks.length > 0 && (
                <div className="space-y-2">
                  <span className="text-sm font-medium text-text-secondary">
                    {websiteLinks.length}/5 URLs
                  </span>
                  {websiteLinks.map((link) => (
                    <div
                      key={link.id}
                      className="flex items-center gap-3 p-3 bg-muted rounded-lg"
                    >
                      <span className="text-lg">{link.favicon || "🌐"}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text-primary truncate">
                          {link.title || link.url}
                        </p>
                        <p className="text-xs text-text-tertiary truncate">
                          {link.url}
                        </p>
                        {link.status === "crawling" && (
                          <div className="flex items-center gap-1 mt-1">
                            <Loader2 className="w-3 h-3 animate-spin text-warning" />
                            <span className="text-xs text-warning">
                              Crawling
                            </span>
                          </div>
                        )}
                        {link.status === "ready" && (
                          <div className="flex items-center gap-1 mt-1">
                            <CheckCircle2 className="w-3 h-3 text-success" />
                            <span className="text-xs text-success">Ready</span>
                          </div>
                        )}
                        {link.status === "error" && (
                          <div className="flex items-center gap-1 mt-1">
                            <AlertCircle className="w-3 h-3 text-error" />
                            <span className="text-xs text-error">Error</span>
                          </div>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeWebsiteLink(link.id)}
                        className="p-1"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Separator />

            {/* Q&A Pairs Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-text-primary">
                    Frequently Asked Questions
                  </h3>
                  <p className="text-sm text-text-secondary mt-1">
                    Add common questions and your preferred answers
                  </p>
                </div>
                <Button variant="leo-primary" onClick={() => openQAModal()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Q&A
                </Button>
              </div>

              {qaPairs.length === 0 ? (
                <div className="text-center py-8 text-text-tertiary">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No Q&As yet. Add your first one!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {qaPairs.map((qa) => (
                    <Card key={qa.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-text-primary line-clamp-2 mb-2">
                            {qa.question}
                          </p>
                          <p className="text-sm text-text-secondary line-clamp-3">
                            {qa.answer.length > 100
                              ? `${qa.answer.substring(0, 100)}...`
                              : qa.answer}
                          </p>
                        </div>
                        <div className="flex gap-1 ml-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openQAModal(qa)}
                          >
                            <Edit3 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeQA(qa.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            <Separator />

            {/* Free Text Knowledge Section */}
            <div>
              <div className="mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-text-primary">
                      Additional Information
                    </h3>
                    <p className="text-sm text-text-secondary mt-1">
                      Add any other information about yourself or your business
                    </p>
                  </div>
                  {isAutoSaving && (
                    <div className="flex items-center gap-2 text-xs text-text-tertiary">
                      <Save className="w-3 h-3" />
                      Auto-saving...
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Textarea
                  value={freeTextKnowledge}
                  onChange={(e) => setFreeTextKnowledge(e.target.value)}
                  placeholder="Tell your AI about your background, expertise, services, company values, or any other relevant information..."
                  rows={8}
                  className="resize-none"
                  onBlur={() => saveFreeText(freeTextKnowledge)}
                />
                <div className="flex justify-between items-center">
                  <span className="text-xs text-text-tertiary">
                    {freeTextKnowledge && freeTextKnowledge.length}/3000 words
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    Auto-save enabled
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>

      {/* Test Interface Panel - Right 40% */}
      <div className="w-2/5 flex flex-col bg-surface">
        <div className="shrink-0 p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-text-primary">
                Test Your AI Assistant
              </h2>
              <p className="text-sm text-text-secondary mt-1">
                Try questions a visitor might ask
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={resetTestChat}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset Chat
            </Button>
          </div>
        </div>

        {/* Chat Interface */}
        <div className="flex-1 flex flex-col">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {testMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.type === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-3 py-2 ${
                      message.type === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-text-primary"
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    {message.type === "ai" && "confidence" in message && (
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/20">
                        <span className="text-xs opacity-70">
                          Confidence:{" "}
                          {Math.round((message.confidence || 0) * 100)}%
                        </span>
                        <span className="text-xs opacity-70">
                          {message.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg px-3 py-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-text-secondary rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-text-secondary rounded-full animate-bounce delay-100"></div>
                      <div className="w-2 h-2 bg-text-secondary rounded-full animate-bounce delay-200"></div>
                    </div>
                  </div>
                </div>
              )}

              {/* Suggested Questions */}
              {testMessages.length === 1 && (
                <div className="space-y-2">
                  <p className="text-xs text-text-tertiary px-2">Try asking:</p>
                  <div className="flex flex-wrap gap-2">
                    {suggestedQuestions.map((question) => (
                      <button
                        key={question}
                        onClick={() => setTestInput(question)}
                        className="text-xs px-3 py-1 bg-primary/10 text-primary rounded-full hover:bg-primary/20 transition-colors"
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="shrink-0 p-4 border-t border-border">
            <div className="flex gap-2">
              <Input
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
                placeholder="Type a test question..."
                onKeyDown={(e) => e.key === "Enter" && sendTestMessage()}
                disabled={isTyping}
              />
              <Button
                variant="leo-primary"
                onClick={sendTestMessage}
                disabled={!testInput.trim() || isTyping}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Q&A Modal */}
      <Dialog open={isQAModalOpen} onOpenChange={setIsQAModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingQA ? "Edit Q&A Pair" : "Add Q&A Pair"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Question</Label>
              <Input
                value={qaForm.question}
                onChange={(e) =>
                  setQAForm((prev) => ({ ...prev, question: e.target.value }))
                }
                placeholder="What question might visitors ask?"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-sm font-medium">Answer</Label>
              <Textarea
                value={qaForm.answer}
                onChange={(e) =>
                  setQAForm((prev) => ({ ...prev, answer: e.target.value }))
                }
                placeholder="Your preferred answer to this question..."
                rows={6}
                className="mt-1 resize-none"
              />
              <p className="text-xs text-text-tertiary mt-1">
                {qaForm.answer.length} characters
              </p>
            </div>
            <div className="flex gap-2 pt-4">
              <Button variant="leo-primary" onClick={saveQA} className="flex-1">
                {editingQA ? "Update Q&A" : "Save Q&A"}
              </Button>
              <Button variant="outline" onClick={() => setIsQAModalOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

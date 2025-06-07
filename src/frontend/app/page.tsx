import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, BookOpen, Scale, FileText, Search, MessageSquare, Brain } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <div className="w-64 flex-shrink-0">
        <Sidebar />
      </div>
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Legal AI Platform" />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Welcome to Legal AI Platform</h1>
              <p className="text-gray-500 dark:text-gray-400">
                Advanced legal research and document analysis powered by AI
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Search className="mr-2 h-5 w-5" />
                    Legal Research
                  </CardTitle>
                  <CardDescription>Search across multiple legal sources</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">Access millions of cases, statutes, and legal documents from multiple sources.</p>
                  <Button asChild>
                    <Link href="/research">
                      Start Researching <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="mr-2 h-5 w-5" />
                    Document Analysis
                  </CardTitle>
                  <CardDescription>AI-powered legal document analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">Upload legal documents for AI analysis, extraction, and summarization.</p>
                  <Button asChild>
                    <Link href="/documents">
                      Analyze Documents <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MessageSquare className="mr-2 h-5 w-5" />
                    Legal Assistant
                  </CardTitle>
                  <CardDescription>Chat with your AI legal assistant</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">Get answers to legal questions with citations and explanations.</p>
                  <Button asChild>
                    <Link href="/chat">
                      Start Chatting <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BookOpen className="mr-2 h-5 w-5" />
                    Legal Sources
                  </CardTitle>
                  <CardDescription>Access multiple legal databases</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">Connect to CourtListener, Caselaw Access Project, and more.</p>
                  <Button asChild>
                    <Link href="/legal-sources">
                      Browse Sources <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Scale className="mr-2 h-5 w-5" />
                    Compliance
                  </CardTitle>
                  <CardDescription>Legal compliance monitoring</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">Monitor legal compliance and stay updated on regulatory changes.</p>
                  <Button asChild>
                    <Link href="/compliance">
                      Check Compliance <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Brain className="mr-2 h-5 w-5" />
                    Agent Swarm
                  </CardTitle>
                  <CardDescription>Multi-agent legal research</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">Deploy specialized AI agents for complex legal research tasks.</p>
                  <Button asChild>
                    <Link href="/agents">
                      Deploy Agents <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

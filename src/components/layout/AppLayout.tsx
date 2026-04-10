import { Upload, Search, BookOpen } from "lucide-react"
import { cn } from "@/lib/utils"

export type AppView = "upload" | "autoIngest" | "researchPapers"

interface AppLayoutProps {
    children: React.ReactNode
    activeView?: AppView
    onNavigate?: (view: AppView) => void
}

function TabButton({
    icon: Icon,
    label,
    active,
    onClick,
}: {
    icon: React.ElementType
    label: string
    active: boolean
    onClick?: () => void
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                "flex items-center gap-2.5 rounded-t-lg px-6 py-3 text-sm font-medium transition-all border-b-2 -mb-px",
                active
                    ? "border-brand-green-500 text-brand-green-700 bg-white"
                    : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            )}
        >
            <Icon
                className={cn(
                    "h-5 w-5",
                    active ? "text-brand-green-600" : "text-gray-400"
                )}
            />
            {label}
        </button>
    )
}

export function AppLayout({ children, activeView = "upload", onNavigate }: AppLayoutProps) {
    return (
        <div className="min-h-screen bg-gray-50/50 flex flex-col">
            {/* Tab bar */}
            <div className="border-b border-gray-200 bg-white/80 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-8 pt-4">
                    <div className="flex gap-1">
                        <TabButton
                            icon={Upload}
                            label="Upload Documents"
                            active={activeView === "upload"}
                            onClick={() => onNavigate?.("upload")}
                        />
                        <TabButton
                            icon={Search}
                            label="Search & Ingest"
                            active={activeView === "autoIngest"}
                            onClick={() => onNavigate?.("autoIngest")}
                        />
                        <TabButton
                            icon={BookOpen}
                            label="Research Papers"
                            active={activeView === "researchPapers"}
                            onClick={() => onNavigate?.("researchPapers")}
                        />
                    </div>
                </div>
            </div>

            {/* Main content */}
            <main className="flex-1">
                <div className="p-8 max-w-7xl mx-auto w-full">
                    {children}
                </div>
            </main>
        </div>
    )
}

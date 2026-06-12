import { useAuth } from "@/_core/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/useMobile";
import Logo from "@/components/Logo";
import {
  LayoutDashboard, LogOut, PanelLeft, Users, BookOpen, CalendarDays,
  FileText, Award, BarChart3, Target, Megaphone, MapPin,
  Clock, CheckCircle2, Activity, MessageSquare, BrainCircuit,
  GraduationCap, Shield, FolderOpen, Cpu, ClipboardList, School, UserCheck,
  HelpCircle, ChevronRight, ShieldCheck, Home,
} from "lucide-react";
import { CSSProperties, useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { DashboardLayoutSkeleton } from "./DashboardLayoutSkeleton";
import { Button } from "./ui/button";
import { useI18n } from "@/contexts/I18nContext";

type MenuItem = {
  icon: React.ForwardRefExoticComponent<Omit<React.ComponentProps<"svg">, "ref"> & React.RefAttributes<SVGSVGElement>>;
  labelKey: string;
  path: string;
  tab?: string;
};

const menuItemsByRole: Record<string, MenuItem[]> = {
  student: [
    { icon: LayoutDashboard, labelKey: "student.dashboard", path: "/dashboard" },
    { icon: BookOpen, labelKey: "student.myCourses", path: "/courses" },
    { icon: CalendarDays, labelKey: "student.schedule", path: "/schedule" },
    { icon: FileText, labelKey: "student.assignments", path: "/assignments" },
    { icon: Award, labelKey: "student.grades", path: "/grades" },
    { icon: CheckCircle2, labelKey: "student.attendance", path: "/attendance" },
    { icon: Megaphone, labelKey: "student.announcements", path: "/announcements" },
    { icon: BarChart3, labelKey: "student.achievements", path: "/achievements" },
    { icon: Target, labelKey: "student.progress", path: "/progress" },
    { icon: BrainCircuit, labelKey: "analytics.title", path: "/analytics" },
    { icon: Clock, labelKey: "student.studyPlan", path: "/study-plan" },
    { icon: MapPin, labelKey: "map.title", path: "/campus" },
    { icon: Users, labelKey: "chat.title", path: "/chat" },
  ],
  advisor: [
    { icon: LayoutDashboard, labelKey: "advisor.dashboard", path: "/advisor" },
    { icon: Users, labelKey: "advisor.myStudents", path: "/advisor/students" },
    { icon: Activity, labelKey: "advisor.studentProfile", path: "/advisor/student-profile" },
    { icon: CalendarDays, labelKey: "advisor.appointments", path: "/advisor/appointments" },
    { icon: MessageSquare, labelKey: "advisor.aiReview", path: "/advisor/ai-review" },
    { icon: HelpCircle, labelKey: "advisor.faqs", path: "/advisor/faqs" },
    { icon: FolderOpen, labelKey: "advisor.documents", path: "/advisor/documents" },
    { icon: BarChart3, labelKey: "analytics.title", path: "/analytics" },
    { icon: MapPin, labelKey: "map.title", path: "/campus" },
  ],
  admin: [
    { icon: LayoutDashboard, labelKey: "admin.dashboard", path: "/admin" },
    { icon: Users, labelKey: "admin.userManagement", path: "/admin", tab: "users" },
    { icon: BookOpen, labelKey: "admin.academicManagement", path: "/admin", tab: "courses" },
    { icon: UserCheck, labelKey: "admin.advisorManagement", path: "/admin", tab: "advisors" },
    { icon: MapPin, labelKey: "admin.campusManagement", path: "/campus" },
    { icon: Megaphone, labelKey: "admin.contentManagement", path: "/admin", tab: "content" },
    { icon: BrainCircuit, labelKey: "admin.aiManagement", path: "/admin", tab: "aiStats" },
    { icon: BarChart3, labelKey: "admin.reportsAnalytics", path: "/admin", tab: "reports" },
  ],
};

const SIDEBAR_WIDTH_KEY = "sidebar-width";
const DEFAULT_WIDTH = 280;
const MIN_WIDTH = 200;
const MAX_WIDTH = 480;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem(SIDEBAR_WIDTH_KEY);
    return saved ? parseInt(saved, 10) : DEFAULT_WIDTH;
  });
  const { loading, user } = useAuth();
  const { t, dir } = useI18n();

  useEffect(() => {
    localStorage.setItem(SIDEBAR_WIDTH_KEY, sidebarWidth.toString());
  }, [sidebarWidth]);

  if (loading) {
    return <DashboardLayoutSkeleton />;
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-8 p-8 max-w-md w-full">
          <div className="flex flex-col items-center gap-6">
            <h1 className="text-2xl font-semibold tracking-tight text-center">
              {t("common.signInToContinue")}
            </h1>
            <p className="text-sm text-muted-foreground text-center max-w-sm">
              {t("common.authRequired")}
            </p>
          </div>
          <Button
            onClick={() => {
              window.location.href = "/login";
            }}
            size="lg"
            className="w-full shadow-lg hover:shadow-xl transition-all"
          >
            {t("auth.signIn")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div dir={dir}>
      <SidebarProvider
        style={
          {
            "--sidebar-width": `${sidebarWidth}px`,
          } as CSSProperties
        }
      >
        <DashboardLayoutContent setSidebarWidth={setSidebarWidth} dir={dir}>
          {children}
        </DashboardLayoutContent>
      </SidebarProvider>
    </div>
  );
}

type DashboardLayoutContentProps = {
  children: React.ReactNode;
  setSidebarWidth: (width: number) => void;
  dir: "ltr" | "rtl";
};

function DashboardLayoutContent({
  children,
  setSidebarWidth,
  dir,
}: DashboardLayoutContentProps) {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const { t } = useI18n();
  const menuItems =
    user?.role === "advisor"
      ? menuItemsByRole.advisor
      : user?.role === "admin"
        ? menuItemsByRole.admin
        : menuItemsByRole.student;
  const localizedMenuItems = menuItems.map(item => ({
    ...item,
    label: t(item.labelKey),
  }));
  const activeMenuItem = localizedMenuItems.find(item => {
    if (item.path !== location) return false;
    if (user?.role === "admin" && item.tab) {
      return window.location.hash.replace("#", "") === item.tab;
    }
    return true;
  }) || localizedMenuItems.find(item => item.path === location);

  useEffect(() => {
    if (isCollapsed) {
      setIsResizing(false);
    }
  }, [isCollapsed]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      const sidebarRect = sidebarRef.current?.getBoundingClientRect();
      const newWidth = dir === "rtl"
        ? (sidebarRect?.right ?? 0) - e.clientX
        : e.clientX - (sidebarRect?.left ?? 0);
      if (newWidth >= MIN_WIDTH && newWidth <= MAX_WIDTH) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing, setSidebarWidth]);

  return (
    <>
      <div className="relative" ref={sidebarRef}>
        <Sidebar
          collapsible="icon"
          className="border-e-0"
          disableTransition={isResizing}
        >
          <SidebarHeader className="h-16 justify-center border-b border-border">
            <div className="flex items-center gap-3 px-3 transition-all w-full">
              <button
                onClick={toggleSidebar}
                className="h-8 w-8 flex items-center justify-center rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring shrink-0 hover:bg-white/[0.08]"
                aria-label="Toggle navigation"
              >
                <PanelLeft className="h-4 w-4 text-slate-400 rtl:rotate-180" />
              </button>
              {!isCollapsed ? (
                <div className="flex items-center gap-2 min-w-0">
                  <Logo size={24} />
                  <span className="font-semibold tracking-tight truncate text-sm">
                    Murshid AI
                  </span>
                </div>
              ) : null}
            </div>
          </SidebarHeader>

          <SidebarContent className="gap-0 py-3">
            <SidebarMenu className="px-2 gap-1">
              {localizedMenuItems.map(item => {
                const isActive = location === item.path && (user?.role !== "admin" || !item.tab || window.location.hash.replace("#", "") === item.tab);
                return (
                  <SidebarMenuItem key={item.labelKey}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.label}
                      className={`h-10 transition-all font-medium rounded-lg my-0.5 ${isActive ? "bg-primary/15 text-primary hover:bg-primary/20" : "text-muted-foreground hover:text-foreground hover:bg-accent/50"}`}
                    >
                      <a
                        href={item.tab ? `/admin#${item.tab}` : item.path}
                        onClick={(e) => {
                          e.preventDefault();
                          if (user?.role === "admin" && item.tab) {
                            setLocation("/admin");
                            window.location.hash = item.tab;
                          } else {
                            setLocation(item.path);
                          }
                        }}
                      >
                        <item.icon
                          className={`h-[18px] w-[18px] ${isActive ? "text-primary" : "text-muted-foreground"}`}
                        />
                        <span className="text-sm">{item.label}</span>
                        {isActive && !isCollapsed && (
                          <ChevronRight className="h-3.5 w-3.5 ms-auto text-primary/60 rtl:rotate-180" />
                        )}
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="p-3 border-t border-border">
            <div className="flex items-center gap-2 px-2 py-2 mb-2 rounded-lg bg-accent border border-border group-data-[collapsible=icon]:justify-center">
              <ShieldCheck className="h-3.5 w-3.5 text-primary shrink-0" />
              {!isCollapsed && (
                <span className="text-[10px] font-medium text-primary uppercase tracking-wider">
                  {user?.role === "advisor" ? "Academic Advisor" : user?.role === "admin" ? "Administrator" : "Student"}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex flex-1 items-center gap-3 rounded-xl px-2 py-2 hover:bg-accent/80 transition-colors text-start group-data-[collapsible=icon]:justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-ring border border-transparent hover:border-border">
                    <Avatar className="h-9 w-9 border border-border shrink-0 bg-muted">
                      <AvatarFallback className="text-xs font-semibold text-foreground">
                        {user?.name?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
                      <p className="text-sm font-semibold truncate leading-none text-foreground">
                        {user?.name || "-"}
                      </p>
                      <p className="text-[11px] text-muted-foreground truncate mt-1">
                        {user?.email || "-"}
                      </p>
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-popover border-border text-popover-foreground">
                  <DropdownMenuItem
                    onClick={logout}
                    className="cursor-pointer text-destructive focus:text-destructive/90 focus:bg-destructive/10"
                  >
                    <LogOut className="me-2 h-4 w-4" />
                    <span>{t("common.logout")}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <button
                onClick={() => setLocation("/")}
                title="Home"
                className="shrink-0 h-9 w-9 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors group-data-[collapsible=icon]:hidden"
              >
                <Home className="h-[18px] w-[18px]" />
              </button>
            </div>
          </SidebarFooter>
        </Sidebar>
        <div
          className={`absolute top-0 end-0 w-1 h-full cursor-col-resize hover:bg-primary/20 transition-colors ${isCollapsed ? "hidden" : ""}`}
          onMouseDown={() => {
            if (isCollapsed) return;
            setIsResizing(true);
          }}
          style={{ zIndex: 50 }}
        />
      </div>

      <SidebarInset className="bg-background">
        {isMobile && (
          <div className="flex border-b border-border h-14 items-center justify-between bg-card/95 px-4 backdrop-blur supports-[backdrop-filter]:backdrop-blur sticky top-0 z-40">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="h-9 w-9 rounded-lg bg-accent border border-border text-muted-foreground hover:bg-accent/80 hover:text-foreground" />
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-foreground tracking-tight">
                  {activeMenuItem?.label ?? t("common.menu")}
                </span>
              </div>
            </div>
          </div>
        )}
        <main className="flex-1 p-3 sm:p-4 md:p-6 overflow-x-hidden">{children}</main>
      </SidebarInset>
    </>
  );
}

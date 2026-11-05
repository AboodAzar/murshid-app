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
  HelpCircle, ChevronRight, ShieldCheck, Home, Sparkles, Globe,
} from "lucide-react";
import { CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "wouter";
import { DashboardLayoutSkeleton } from "./DashboardLayoutSkeleton";
import { Button } from "./ui/button";
import { useI18n } from "@/contexts/I18nContext";
import { formatUniversityId } from "@/lib/academicUtils";

type MenuItem = {
  icon: React.ForwardRefExoticComponent<Omit<React.ComponentProps<"svg">, "ref"> & React.RefAttributes<SVGSVGElement>>;
  labelKey: string;
  path: string;
  tab?: string;
};

const menuItemsByRole: Record<string, MenuItem[]> = {
  student: [
    { icon: LayoutDashboard, labelKey: "student.dashboard", path: "/dashboard" },
    { icon: CalendarDays, labelKey: "student.schedule", path: "/schedule" },
    { icon: Sparkles, labelKey: "chat.title", path: "/chat" },
    { icon: FileText, labelKey: "student.assignments", path: "/assignments" },
    { icon: CheckCircle2, labelKey: "student.attendance", path: "/attendance" },
    { icon: BookOpen, labelKey: "student.myCourses", path: "/courses" },
    { icon: Award, labelKey: "student.grades", path: "/grades" },
    { icon: Megaphone, labelKey: "student.announcements", path: "/announcements" },
    { icon: BarChart3, labelKey: "student.achievements", path: "/achievements" },
    { icon: Target, labelKey: "student.progress", path: "/progress" },
    { icon: BrainCircuit, labelKey: "analytics.title", path: "/analytics" },
    { icon: Clock, labelKey: "student.studyPlan", path: "/study-plan" },
    { icon: MapPin, labelKey: "map.title", path: "/campus" },
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
  const { t, language, setLanguage } = useI18n();
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

  const mobileNavItems = useMemo(() => {
    if (user?.role === "advisor") {
      return [
        { icon: LayoutDashboard, label: t("advisor.dashboard") || "Dashboard", path: "/advisor", tab: undefined, highlight: false },
        { icon: Users, label: t("advisor.myStudents") || "Students", path: "/advisor/students", tab: undefined, highlight: false },
        { icon: BrainCircuit, label: "AI Advisor", path: "/advisor/ai-review", tab: undefined, highlight: true },
        { icon: CalendarDays, label: t("advisor.appointments") || "Calendar", path: "/advisor/appointments", tab: undefined, highlight: false },
        { icon: MapPin, label: t("map.title") || "Campus", path: "/campus", tab: undefined, highlight: false },
      ];
    }
    if (user?.role === "admin") {
      return [
        { icon: LayoutDashboard, label: t("admin.dashboard") || "Admin", path: "/admin", tab: undefined, highlight: false },
        { icon: Users, label: t("admin.userManagement") || "Users", path: "/admin", tab: "users", highlight: false },
        { icon: BookOpen, label: t("admin.academicManagement") || "Courses", path: "/admin", tab: "courses", highlight: false },
        { icon: BrainCircuit, label: "AI Stats", path: "/admin", tab: "aiStats", highlight: true },
        { icon: MapPin, label: t("admin.campusManagement") || "Campus", path: "/campus", tab: undefined, highlight: false },
      ];
    }
    return [
      { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard", tab: undefined, highlight: false },
      { icon: CalendarDays, label: "Schedule", path: "/schedule", tab: undefined, highlight: false },
      { icon: Sparkles, label: "Oliver AI", path: "/chat", tab: undefined, highlight: true },
      { icon: FileText, label: "Assignments", path: "/assignments", tab: undefined, highlight: false },
      { icon: CheckCircle2, label: "Attendence", path: "/attendance", tab: undefined, highlight: false },
    ];
  }, [user?.role, t]);

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
                    Oliver AI
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
                      <p className="text-[10px] font-mono text-emerald-400 font-bold truncate mt-1">
                        ID: {formatUniversityId(user)}
                      </p>
                      <p className="text-[10px] text-muted-foreground truncate">
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
        {/* Top Header Bar for Mobile (Touch-First UI/UX Pro Max) */}
        <div className="md:hidden flex border-b border-border/80 h-14 items-center justify-between bg-card/95 px-3.5 backdrop-blur-md sticky top-0 z-40 shadow-sm">
          <div className="flex items-center gap-2.5 min-w-0">
            <SidebarTrigger className="h-9 w-9 rounded-xl bg-accent/60 border border-border text-foreground hover:bg-accent focus-visible:ring-2 focus-visible:ring-emerald-500 shrink-0" aria-label="Open menu drawer" />
            <div className="flex items-center gap-2 min-w-0">
              <Logo size={22} />
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-foreground truncate leading-tight">Oliver AI</span>
                {user?.role === "student" && (
                  <span className="text-[10px] font-mono text-emerald-400 font-semibold truncate leading-none">
                    {formatUniversityId(user)}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* 1-Click Language Switcher (AR / EN) */}
            <button
              onClick={() => setLanguage(language === "ar" ? "en" : "ar")}
              className="h-8 px-2.5 rounded-lg bg-accent/60 border border-border hover:bg-accent text-xs font-semibold text-foreground flex items-center gap-1.5 transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500"
              aria-label="Toggle language"
              title={language === "ar" ? "Switch to English" : "التبديل إلى العربية"}
            >
              <Globe className="h-3.5 w-3.5 text-emerald-400" />
              <span>{language === "ar" ? "EN" : "عربي"}</span>
            </button>

            {/* Quick Profile/Logout Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="h-8 w-8 rounded-lg border border-border bg-muted flex items-center justify-center text-xs font-bold text-foreground focus-visible:ring-2 focus-visible:ring-emerald-500"
                  aria-label="User profile"
                >
                  {user?.name?.charAt(0).toUpperCase()}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 bg-popover border-border text-popover-foreground">
                <div className="px-3 py-2 border-b border-border">
                  <p className="text-xs font-semibold text-foreground truncate">{user?.name}</p>
                  <p className="text-[10px] font-mono text-emerald-400">{formatUniversityId(user)}</p>
                </div>
                <DropdownMenuItem
                  onClick={logout}
                  className="cursor-pointer text-destructive focus:text-destructive/90 focus:bg-destructive/10 text-xs py-2"
                >
                  <LogOut className="me-2 h-3.5 w-3.5" />
                  <span>{t("common.logout")}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Main Content Area with safe-area bottom compensation so fixed navigation never overlaps widgets */}
        <main className="flex-1 p-3 sm:p-4 md:p-6 overflow-x-hidden pb-24 md:pb-6">{children}</main>

        {/* Mobile Bottom Navigation Bar (UI/UX Pro Max 44px+ touch targets & visual indicators) */}
        <nav
          aria-label="Mobile Navigation"
          className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-card/95 backdrop-blur-lg border-t border-border shadow-[0_-4px_20px_rgba(0,0,0,0.3)] pb-[env(safe-area-inset-bottom)]"
        >
          <div className="grid grid-cols-5 h-16 max-w-lg mx-auto px-1 items-center">
            {mobileNavItems.map((item) => {
              const isActive = location === item.path && (!item.tab || window.location.hash.replace("#", "") === item.tab);
              const Icon = item.icon;

              if (item.highlight) {
                return (
                  <button
                    key={item.label}
                    onClick={() => {
                      if (item.tab) {
                        setLocation(item.path);
                        window.location.hash = item.tab;
                      } else {
                        setLocation(item.path);
                      }
                    }}
                    className="flex flex-col items-center justify-center min-h-[48px] min-w-[48px] py-1 px-1 transition-transform active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-xl"
                  >
                    <div className="relative -top-2 w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 via-green-600 to-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/30 border border-emerald-300/40">
                      <Icon className="h-5 w-5 text-white" />
                      <span className="absolute -top-1 -end-1 flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-300"></span>
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-400 tracking-tight -mt-1 truncate max-w-[64px]">
                      {item.label}
                    </span>
                  </button>
                );
              }

              return (
                <button
                  key={item.label}
                  onClick={() => {
                    if (item.tab) {
                      setLocation(item.path);
                      window.location.hash = item.tab;
                    } else {
                      setLocation(item.path);
                    }
                  }}
                  className={`flex flex-col items-center justify-center min-h-[48px] min-w-[48px] py-1.5 px-1 rounded-xl transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                    isActive
                      ? "text-emerald-400 font-bold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <div className={`p-1 rounded-lg transition-colors ${isActive ? "bg-emerald-500/15" : "transparent"}`}>
                    <Icon className={`h-5 w-5 ${isActive ? "text-emerald-400 stroke-[2.25]" : "text-muted-foreground"}`} />
                  </div>
                  <span className={`text-[10px] truncate max-w-[64px] ${isActive ? "font-bold text-foreground" : "font-medium"}`}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>
      </SidebarInset>
    </>
  );
}

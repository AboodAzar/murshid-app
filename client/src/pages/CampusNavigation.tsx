import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/_core/hooks/useAuth";
import { useI18n } from "@/contexts/I18nContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MapPin, Navigation, Search, Building2, DoorOpen, ExternalLink, Globe,
  Video, Map, GraduationCap, FlaskConical, Users, Monitor, ArrowUpDown,
  Clock, ChevronRight, AlertTriangle, Accessibility, Phone,
  Route, Footprints, Compass, BookOpen, Wifi, BrainCircuit,
  ShieldCheck, MousePointerClick, Layers, CalendarDays, UserCircle,
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 },
};

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.06 } },
};

/* ─── Static Faculty Data ─── */
const FACULTY_DEPTS = [
  { name: "Computer Science", nameAr: "علوم الحاسوب", code: "CS", students: 840 },
  { name: "Information Technology", nameAr: "تكنولوجيا المعلومات", code: "IT", students: 620 },
  { name: "Software Engineering", nameAr: "هندسة البرمجيات", code: "SE", students: 510 },
  { name: "Artificial Intelligence", nameAr: "الذكاء الاصطناعي", code: "AI", students: 290 },
];

const FACULTY_DIRECTORY = [
  { title: "Dean Office", name: "Prof. Ahmad Al-Khatib", role: "Dean", floor: 2, room: "2-101", icon: GraduationCap },
  { title: "CS Department Head", name: "Dr. Rami Suleiman", role: "Professor", floor: 1, room: "1-105", icon: Monitor },
  { title: "IT Department Head", name: "Dr. Khaled Mahmoud", role: "Professor", floor: 1, room: "1-106", icon: Wifi },
  { title: "SE Department Head", name: "Dr. Yasser Abu Zaid", role: "Professor", floor: 1, room: "1-107", icon: Layers },
  { title: "AI Department Head", name: "Dr. Huda Nasser", role: "Associate Professor", floor: 1, room: "1-108", icon: BrainCircuit },
  { title: "Academic Advisor — CS", name: "Dr. Mona Faris", role: "Advisor", floor: 1, room: "1-109", icon: UserCircle },
  { title: "Academic Advisor — IT", name: "Dr. Sami Haddad", role: "Advisor", floor: 1, room: "1-110", icon: UserCircle },
  { title: "Academic Advisor — SE", name: "Dr. Layla Omar", role: "Advisor", floor: 1, room: "1-111", icon: UserCircle },
  { title: "Faculty Member", name: "Dr. Ibrahim Qasem", role: "Lecturer", floor: 2, room: "2-205", icon: BookOpen },
  { title: "Faculty Member", name: "Dr. Nadia Hassan", role: "Lecturer", floor: 2, room: "2-206", icon: BookOpen },
];

const STUDENT_SERVICES = [
  { name: "Registration Office", nameAr: "مكتب التسجيل", floor: 0, room: "G-01", icon: BookOpen, hours: "8:00 AM – 3:00 PM" },
  { name: "Student Affairs", nameAr: "شؤون الطلبة", floor: 0, room: "G-02", icon: Users, hours: "8:00 AM – 2:00 PM" },
  { name: "IT Support", nameAr: "دعم تكنولوجيا المعلومات", floor: 0, room: "G-03", icon: Monitor, hours: "8:00 AM – 4:00 PM" },
  { name: "Faculty Library", nameAr: "مكتبة الكلية", floor: 1, room: "1-102", icon: BookOpen, hours: "7:00 AM – 8:00 PM" },
  { name: "Cafeteria", nameAr: "المقصف", floor: 0, room: "G-Cafe", icon: MapPin, hours: "7:00 AM – 6:00 PM" },
  { name: "Prayer Area", nameAr: "مصلى", floor: 0, room: "G-PA", icon: Compass, hours: "Open 24h" },
];

const EMERGENCY_INFO = [
  { label: "Main Emergency Exit", location: "Ground Floor — East Wing", icon: AlertTriangle, color: "text-red-400" },
  { label: "Secondary Emergency Exit", location: "First Floor — West Staircase", icon: AlertTriangle, color: "text-red-400" },
  { label: "Elevator A", location: "Ground Floor — Main Lobby", icon: Accessibility, color: "text-blue-400" },
  { label: "Elevator B", location: "First Floor — Near Labs", icon: Accessibility, color: "text-blue-400" },
  { label: "Security Desk", location: "Ground Floor — Main Entrance", icon: ShieldCheck, color: "text-emerald-400" },
  { label: "Security Hotline", location: "+962 6 429 1511 ext. 9911", icon: Phone, color: "text-emerald-400" },
];

const ROUTES: Record<string, { label: string; steps: { floor: number; desc: string; eta: string }[] }> = {
  "main-entrance_to_dean": {
    label: "Main Entrance → Dean Office",
    steps: [
      { floor: 0, desc: "Enter through Main Entrance", eta: "0 min" },
      { floor: 0, desc: "Walk to Elevator A (Main Lobby)", eta: "1 min" },
      { floor: 2, desc: "Take elevator to Floor 2", eta: "2 min" },
      { floor: 2, desc: "Turn right, walk to Room 2-101", eta: "3 min" },
    ],
  },
  "main-entrance_to_cs-lab": {
    label: "Main Entrance → CS Computer Lab",
    steps: [
      { floor: 0, desc: "Enter through Main Entrance", eta: "0 min" },
      { floor: 0, desc: "Walk straight to Staircase B", eta: "1 min" },
      { floor: 1, desc: "Climb stairs to Floor 1", eta: "2 min" },
      { floor: 1, desc: "Turn left, Room 1-L01 is on your right", eta: "3 min" },
    ],
  },
  "main-entrance_to_library": {
    label: "Main Entrance → Faculty Library",
    steps: [
      { floor: 0, desc: "Enter through Main Entrance", eta: "0 min" },
      { floor: 0, desc: "Walk past Registration Office", eta: "1 min" },
      { floor: 1, desc: "Take Elevator A to Floor 1", eta: "2 min" },
      { floor: 1, desc: "Turn left, Library is Room 1-102", eta: "3 min" },
    ],
  },
  "main-entrance_to_ai-lab": {
    label: "Main Entrance → AI & ML Lab",
    steps: [
      { floor: 0, desc: "Enter through Main Entrance", eta: "0 min" },
      { floor: 0, desc: "Walk to Staircase A (East Wing)", eta: "1.5 min" },
      { floor: 1, desc: "Climb stairs to Floor 1", eta: "2.5 min" },
      { floor: 1, desc: "Turn right, Room 1-L03 on your left", eta: "3.5 min" },
    ],
  },
};

function typeIcon(type: string) {
  switch (type) {
    case "lab": return FlaskConical;
    case "office": return Users;
    case "lecture_hall": return GraduationCap;
    default: return Monitor;
  }
}

function typeColor(type: string) {
  switch (type) {
    case "lab": return "bg-amber-500/15 text-amber-400 border-amber-500/30";
    case "office": return "bg-blue-500/15 text-blue-400 border-blue-500/30";
    case "lecture_hall": return "bg-violet-500/15 text-violet-400 border-violet-500/30";
    default: return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
  }
}

export default function CampusNavigation() {
  const { t } = useI18n();
  const { user } = useAuth();

  /* ─── Queries ─── */
  const { data: campus, isLoading: campusLoading } = trpc.navigation.campus.useQuery();
  const { data: todaySchedule } = trpc.student.todaySchedule.useQuery(
    undefined,
    { enabled: user?.role === "student", retry: false }
  );

  const buildings = campus?.buildings ?? [];
  const rooms = campus?.rooms ?? [];

  const facultyBuilding = buildings[0];
  const totalFloors = rooms.length > 0 ? Math.max(...rooms.map(r => r.floor)) + 1 : 0;
  const labCount = rooms.filter(r => r.type === "lab").length;
  const officeCount = rooms.filter(r => r.type === "office").length;
  const classroomCount = rooms.filter(r => r.type === "classroom" || r.type === "lecture_hall").length;

  /* ─── Local State ─── */
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [selectedRoute, setSelectedRoute] = useState<string>("");
  const [activeFloor, setActiveFloor] = useState<number>(0);

  /* ─── Search ─── */
  const filteredRooms = rooms.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.building ?? "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || r.type === filterType;
    return matchesSearch && matchesType;
  });

  const floorRooms = rooms.filter(r => r.floor === activeFloor);

  /* ─── Effects ─── */
  useEffect(() => {
    if (facultyBuilding) setSelectedRoom(null);
  }, [facultyBuilding]);

  /* ─── Helpers ─── */
  const openGoogleDirections = (lat: number, lng: number) => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, "_blank");
  };

  const roomTypeLabel = (type: string) => {
    switch (type) {
      case "lab": return "Laboratory";
      case "office": return "Office";
      case "lecture_hall": return "Lecture Hall";
      default: return "Classroom";
    }
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case "ongoing": return <Badge className="bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30">Ongoing</Badge>;
      case "upcoming": return <Badge className="bg-blue-500/20 text-blue-400 hover:bg-blue-500/30">Upcoming</Badge>;
      default: return <Badge variant="secondary">Completed</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div variants={fadeInUp} initial="initial" animate="animate" className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-white">Smart Campus</h1>
              <p className="text-slate-400 mt-1">
                Faculty of Science and Information Technology — Al-Zaytoonah University of Jordan
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-white"
                onClick={() => facultyBuilding && openGoogleDirections(facultyBuilding.lat, facultyBuilding.lng)}
              >
                <Navigation className="w-4 h-4 mr-2" />
                Directions
              </Button>
              <Button
                className="bg-emerald-600 hover:bg-emerald-500 text-white"
                onClick={() => window.open("https://vt.zuj.edu.jo/", "_blank")}
              >
                <Video className="w-4 h-4 mr-2" />
                360° Tour
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Building2, label: "Departments", value: FACULTY_DEPTS.length, color: "text-blue-400" },
            { icon: Monitor, label: "Classrooms", value: classroomCount, color: "text-emerald-400" },
            { icon: FlaskConical, label: "Labs", value: labCount, color: "text-amber-400" },
            { icon: Users, label: "Offices", value: officeCount, color: "text-violet-400" },
          ].map((stat, i) => (
            <motion.div key={i} variants={fadeInUp}>
              <Card className="bg-white/[0.04] border-white/10 backdrop-blur-2xl">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                    <p className="text-xs text-slate-400">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-white/[0.04] border border-white/10 p-1 flex-wrap h-auto gap-1">
            {[
              { id: "overview", label: "Overview", icon: Building2 },
              { id: "building", label: "Building", icon: Layers },
              { id: "finder", label: "Room Finder", icon: Search },
              { id: "lectures", label: "Today's Lectures", icon: CalendarDays },
              { id: "directory", label: "Directory", icon: Users },
              { id: "services", label: "Services", icon: MapPin },
              { id: "planner", label: "Route Planner", icon: Route },
              { id: "emergency", label: "Emergency", icon: ShieldCheck },
            ].map(tab => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="data-[state=active]:bg-blue-600/20 data-[state=active]:text-blue-400 data-[state=active]:border-blue-500/40 text-slate-400 text-xs px-3 py-2 rounded-lg border border-transparent gap-1.5"
              >
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* ── Overview ── */}
          <TabsContent value="overview" className="mt-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <motion.div variants={fadeInUp} initial="initial" animate="animate" className="lg:col-span-1 space-y-4">
                <Card className="bg-white/[0.04] border-white/10 backdrop-blur-2xl overflow-hidden">
                  <div className="h-40 bg-gradient-to-br from-blue-900/60 to-slate-900 relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Building2 className="w-20 h-20 text-blue-400/20" />
                    </div>
                    <div className="absolute bottom-4 left-5">
                      <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">{facultyBuilding?.code ?? "FST"}</Badge>
                    </div>
                  </div>
                  <CardContent className="p-5 space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{facultyBuilding?.name ?? "Faculty of Science & IT"}</h3>
                      <p className="text-sm text-slate-400 mt-1">Al-Zaytoonah University of Jordan</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="p-3 rounded-lg bg-white/[0.03] border border-white/5">
                        <p className="text-slate-500 text-xs">Total Floors</p>
                        <p className="text-white font-medium">{totalFloors}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-white/[0.03] border border-white/5">
                        <p className="text-slate-500 text-xs">Total Rooms</p>
                        <p className="text-white font-medium">{rooms.length}</p>
                      </div>
                    </div>
                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-500"
                      onClick={() => facultyBuilding && openGoogleDirections(facultyBuilding.lat, facultyBuilding.lng)}
                    >
                      <Navigation className="w-4 h-4 mr-2" />
                      Navigate to Faculty
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-white/[0.04] border-white/10 backdrop-blur-2xl">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-blue-400" />
                      Departments
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {FACULTY_DEPTS.map(dept => (
                      <div key={dept.code} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03] border border-white/5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-500/15 flex items-center justify-center text-xs font-bold text-blue-400">{dept.code}</div>
                          <div>
                            <p className="text-sm font-medium text-white">{dept.name}</p>
                            <p className="text-xs text-slate-500">{dept.nameAr}</p>
                          </div>
                        </div>
                        <span className="text-xs text-slate-400">{dept.students} students</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={fadeInUp} initial="initial" animate="animate" className="lg:col-span-2">
                <Card className="bg-white/[0.04] border-white/10 backdrop-blur-2xl h-full min-h-[500px]">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Map className="w-4 h-4 text-blue-400" />
                      Interactive Campus Map
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="h-[calc(100%-80px)]">
                    <div className="w-full h-full rounded-xl border border-white/10 overflow-hidden bg-slate-900 relative">
                      <iframe
                        width="100%"
                        height="100%"
                        style={{ border: 0, filter: "invert(90%) hue-rotate(180deg)" }}
                        loading="lazy"
                        allowFullScreen
                        referrerPolicy="no-referrer-when-downgrade"
                        src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1500!2d${facultyBuilding?.lng ?? 35.8925197}!3d${facultyBuilding?.lat ?? 31.8328215}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x151ca80b4f85044f%3A0x776897247c8c93f9!2sAl-Zaytoonah%20University%20of%20Jordan!5e0!3m2!1sen!2sjo!4v1`}
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Virtual Tour Banner */}
            <motion.div variants={fadeInUp} initial="initial" animate="animate">
              <Card className="bg-gradient-to-r from-emerald-900/30 to-slate-900/30 border-emerald-500/20 backdrop-blur-2xl">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-emerald-500/15 flex items-center justify-center shrink-0">
                        <Video className="w-6 h-6 text-emerald-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">ZUJ 360° Faculty Experience</h3>
                        <p className="text-sm text-slate-400 mt-1 max-w-lg">
                          Explore the Faculty of Science and Information Technology in an immersive 360° panoramic walkthrough.
                        </p>
                      </div>
                    </div>
                    <Button
                      className="bg-emerald-600 hover:bg-emerald-500 text-white shrink-0"
                      onClick={() => window.open("https://vt.zuj.edu.jo/", "_blank")}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Launch Virtual Tour
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* ── Building Navigation ── */}
          <TabsContent value="building" className="mt-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-1 space-y-4">
                <Card className="bg-white/[0.04] border-white/10 backdrop-blur-2xl">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <ArrowUpDown className="w-4 h-4 text-blue-400" />
                      Select Floor
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {Array.from({ length: totalFloors }, (_, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveFloor(i)}
                        className={`w-full p-3 rounded-lg text-left transition-all border ${
                          activeFloor === i
                            ? "bg-blue-600/15 border-blue-500/40 text-white"
                            : "bg-white/[0.03] border-white/5 text-slate-400 hover:bg-white/[0.06]"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{i === 0 ? "Ground Floor" : `Floor ${i}`}</span>
                          <span className="text-xs text-slate-500">{rooms.filter(r => r.floor === i).length} rooms</span>
                        </div>
                      </button>
                    ))}
                  </CardContent>
                </Card>
              </div>
              <div className="lg:col-span-3">
                <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  <AnimatePresence mode="popLayout">
                    {floorRooms.map((room) => {
                      const Icon = typeIcon(room.type);
                      return (
                        <motion.div key={room.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2 }}>
                          <Card className={`bg-white/[0.04] border-white/10 backdrop-blur-2xl cursor-pointer hover:bg-white/[0.06] transition-colors ${selectedRoom?.id === room.id ? "ring-1 ring-blue-500/50" : ""}`} onClick={() => setSelectedRoom(room)}>
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between mb-3">
                                <div className={`p-2 rounded-lg ${typeColor(room.type)}`}><Icon className="w-4 h-4" /></div>
                                <Badge variant="outline" className="border-white/10 text-slate-400 text-[10px]">{roomTypeLabel(room.type)}</Badge>
                              </div>
                              <h4 className="text-sm font-semibold text-white">{room.name}</h4>
                              <p className="text-xs text-slate-400 mt-1">Room {room.roomNumber}</p>
                              <div className="flex items-center gap-3 mt-3 text-xs text-slate-500">
                                <span className="flex items-center gap-1"><Users className="w-3 h-3" />{room.capacity}</span>
                                <span className="flex items-center gap-1"><ArrowUpDown className="w-3 h-3" />Floor {room.floor}</span>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </motion.div>
              </div>
            </div>
          </TabsContent>

          {/* ── Smart Classroom Finder ── */}
          <TabsContent value="finder" className="mt-6 space-y-6">
            <Card className="bg-white/[0.04] border-white/10 backdrop-blur-2xl">
              <CardContent className="p-5 space-y-4">
                <div className="flex flex-col md:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <Input placeholder="Search by room number, name, or course..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10 bg-white/[0.03] border-white/10 text-white placeholder:text-slate-500" />
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {["all", "classroom", "lab", "office", "lecture_hall"].map(type => (
                      <button key={type} onClick={() => setFilterType(type)} className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${filterType === type ? "bg-blue-600/20 text-blue-400 border-blue-500/40" : "bg-white/[0.03] text-slate-400 border-white/10 hover:bg-white/[0.06]"}`}>
                        {type === "all" ? "All" : roomTypeLabel(type)}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              <AnimatePresence mode="popLayout">
                {filteredRooms.map((room) => {
                  const Icon = typeIcon(room.type);
                  return (
                    <motion.div key={room.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                      <Card className="bg-white/[0.04] border-white/10 backdrop-blur-2xl hover:bg-white/[0.06] transition-colors">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className={`p-2 rounded-lg ${typeColor(room.type)}`}><Icon className="w-4 h-4" /></div>
                            <Badge variant="outline" className="border-white/10 text-slate-400 text-[10px]">{roomTypeLabel(room.type)}</Badge>
                          </div>
                          <h4 className="text-sm font-semibold text-white">{room.name}</h4>
                          <p className="text-xs text-slate-400 mt-1">Room {room.roomNumber} — {room.building}</p>
                          <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                            <span className="flex items-center gap-1"><Users className="w-3 h-3" />{room.capacity} seats</span>
                            <span className="flex items-center gap-1"><ArrowUpDown className="w-3 h-3" />Floor {room.floor}</span>
                          </div>
                          <div className="flex gap-2 mt-3">
                            <Button size="sm" className="flex-1 bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 border border-blue-500/30" onClick={() => { setActiveFloor(room.floor); setActiveTab("building"); setSelectedRoom(room); }}>
                              <MousePointerClick className="w-3 h-3 mr-1" />Locate
                            </Button>
                            <Button size="sm" variant="outline" className="flex-1 border-white/10 text-slate-400 hover:bg-white/[0.06]" onClick={() => facultyBuilding && openGoogleDirections(facultyBuilding.lat, facultyBuilding.lng)}>
                              <Navigation className="w-3 h-3 mr-1" />Navigate
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </TabsContent>

          {/* ── Today's Lectures ── */}
          <TabsContent value="lectures" className="mt-6 space-y-6">
            <Card className="bg-white/[0.04] border-white/10 backdrop-blur-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-blue-400" />
                  Today's Lecture Schedule
                </CardTitle>
                <CardDescription className="text-slate-400">
                  {todaySchedule && todaySchedule.length > 0 ? `${todaySchedule.length} lecture${todaySchedule.length > 1 ? "s" : ""} scheduled for today` : "No lectures scheduled for today"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {todaySchedule && todaySchedule.length > 0 ? (
                  todaySchedule.map((lecture) => (
                    <motion.div key={lecture.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] transition-colors">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-lg bg-blue-500/15 flex items-center justify-center shrink-0">
                          <GraduationCap className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm font-semibold text-white">{lecture.courseName}</h4>
                            {statusBadge(lecture.status)}
                          </div>
                          <p className="text-xs text-slate-400 mt-1">{lecture.courseCode} — {lecture.lecturerName}</p>
                          <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{lecture.startTime} – {lecture.endTime}</span>
                            <span className="flex items-center gap-1"><DoorOpen className="w-3 h-3" />{lecture.roomName ?? "TBA"}</span>
                            <span className="flex items-center gap-1"><ArrowUpDown className="w-3 h-3" />Floor {lecture.floor ?? "—"}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {lecture.status === "upcoming" && <span className="text-xs text-blue-400">in {lecture.countdownMinutes} min</span>}
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-500" onClick={() => { if (lecture.floor != null) { setActiveFloor(lecture.floor); setActiveTab("building"); } }}>
                          <Navigation className="w-3 h-3 mr-1" />Go
                        </Button>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-10 text-slate-500">
                    <CalendarDays className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No lectures scheduled for today.</p>
                    <p className="text-xs mt-1">Enjoy your free day!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Faculty Directory ── */}
          <TabsContent value="directory" className="mt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {FACULTY_DIRECTORY.map((entry, idx) => {
                const Icon = entry.icon;
                return (
                  <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03 }}>
                    <Card className="bg-white/[0.04] border-white/10 backdrop-blur-2xl hover:bg-white/[0.06] transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-lg bg-blue-500/15 flex items-center justify-center shrink-0">
                            <Icon className="w-5 h-5 text-blue-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-white">{entry.name}</p>
                            <p className="text-xs text-slate-400">{entry.title}</p>
                            <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                              <span className="flex items-center gap-1"><DoorOpen className="w-3 h-3" />{entry.room}</span>
                              <span className="flex items-center gap-1"><ArrowUpDown className="w-3 h-3" />Floor {entry.floor}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </TabsContent>

          {/* ── Student Services ── */}
          <TabsContent value="services" className="mt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {STUDENT_SERVICES.map((service, idx) => {
                const Icon = service.icon;
                return (
                  <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                    <Card className="bg-white/[0.04] border-white/10 backdrop-blur-2xl hover:bg-white/[0.06] transition-colors">
                      <CardContent className="p-5">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-lg bg-emerald-500/15 flex items-center justify-center shrink-0">
                            <Icon className="w-5 h-5 text-emerald-400" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-white">{service.name}</p>
                            <p className="text-xs text-slate-500">{service.nameAr}</p>
                            <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                              <span className="flex items-center gap-1"><DoorOpen className="w-3 h-3" />{service.room}</span>
                              <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{service.hours}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </TabsContent>

          {/* ── Route Planner ── */}
          <TabsContent value="planner" className="mt-6 space-y-6">
            <Card className="bg-white/[0.04] border-white/10 backdrop-blur-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Route className="w-4 h-4 text-blue-400" />Smart Route Planner</CardTitle>
                <CardDescription className="text-slate-400">Choose a destination to get step-by-step directions from the main entrance.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.entries(ROUTES).map(([key, route]) => (
                    <button key={key} onClick={() => setSelectedRoute(key)} className={`p-3 rounded-lg text-left border transition-all ${selectedRoute === key ? "bg-blue-600/15 border-blue-500/40 text-white" : "bg-white/[0.03] border-white/5 text-slate-400 hover:bg-white/[0.06]"}`}>
                      <div className="flex items-center gap-2"><Footprints className="w-4 h-4" /><span className="text-sm font-medium">{route.label}</span></div>
                    </button>
                  ))}
                </div>
                <AnimatePresence>
                  {selectedRoute && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                      <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-3">
                        <div className="flex items-center gap-2 text-sm font-medium text-white">
                          <Compass className="w-4 h-4 text-blue-400" />
                          {ROUTES[selectedRoute].label}
                        </div>
                        <div className="space-y-2">
                          {ROUTES[selectedRoute].steps.map((step, i) => (
                            <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/5">
                              <div className="w-6 h-6 rounded-full bg-blue-500/15 flex items-center justify-center shrink-0 text-xs font-bold text-blue-400">{i + 1}</div>
                              <div className="flex-1">
                                <p className="text-sm text-white">{step.desc}</p>
                                <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                                  <span className="flex items-center gap-1"><ArrowUpDown className="w-3 h-3" />Floor {step.floor}</span>
                                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{step.eta}</span>
                                </div>
                              </div>
                              {i < ROUTES[selectedRoute].steps.length - 1 && <ChevronRight className="w-4 h-4 text-slate-600 self-center" />}
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 pt-1">
                          <Footprints className="w-3 h-3" />
                          Estimated walking time: {ROUTES[selectedRoute].steps[ROUTES[selectedRoute].steps.length - 1].eta}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Emergency & Accessibility ── */}
          <TabsContent value="emergency" className="mt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {EMERGENCY_INFO.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}>
                    <Card className="bg-white/[0.04] border-white/10 backdrop-blur-2xl hover:bg-white/[0.06] transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                            <Icon className={`w-5 h-5 ${item.color}`} />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-white">{item.label}</p>
                            <p className="text-xs text-slate-400 mt-1">{item.location}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
            <Card className="bg-gradient-to-r from-red-900/20 to-slate-900/20 border-red-500/20 backdrop-blur-2xl">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-red-500/15 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Emergency Procedures</p>
                    <p className="text-xs text-slate-400 mt-1">
                      In case of emergency, follow marked exit routes. Assembly point is at the main campus courtyard.
                      Contact security immediately via the hotline or visit the desk at the main entrance.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

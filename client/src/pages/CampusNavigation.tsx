import { useState, useEffect, useMemo } from "react";
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
  ShieldCheck, Layers, CalendarDays, UserCircle, LocateFixed,
  Eye, RefreshCw, CheckCircle2, Navigation2, Crosshair, Sparkles
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const fadeInUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35 },
};

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.05 } },
};

/* ─── Official ZUJ Campus Landmarks & Coordinates ─── */
interface CampusLandmark {
  id: string;
  name: string;
  nameAr: string;
  category: "faculty" | "admin" | "service" | "sports";
  lat: number;
  lng: number;
  code: string;
  description: string;
  descriptionAr: string;
  openHours: string;
  floorCount: number;
}

const CAMPUS_LANDMARKS: CampusLandmark[] = [
  {
    id: "fsit",
    name: "Faculty of Science & IT",
    nameAr: "كلية العلوم وتكنولوجيا المعلومات",
    category: "faculty",
    lat: 31.8328215,
    lng: 35.8925197,
    code: "FSIT",
    description: "Hub for CS, Software Engineering, AI, and Cybersecurity departments and laboratories.",
    descriptionAr: "المقر الرئيسي لأقسام ومختبرات علوم الحاسوب وهندسة البرمجيات والذكاء الاصطناعي والأمن السيبراني.",
    openHours: "07:30 AM – 06:00 PM",
    floorCount: 3,
  },
  {
    id: "eng",
    name: "Faculty of Engineering & Tech",
    nameAr: "كلية الهندسة والتكنولوجيا",
    category: "faculty",
    lat: 31.833500,
    lng: 35.891800,
    code: "FENG",
    description: "Civil, Mechanical, Electrical, and Mechatronics engineering labs and workshops.",
    descriptionAr: "مختبرات وورش الهندسة المدنية والميكانيكية والكهربائية والميكاترونكس.",
    openHours: "08:00 AM – 05:00 PM",
    floorCount: 4,
  },
  {
    id: "pharm",
    name: "Faculty of Pharmacy & Nursing",
    nameAr: "كلية الصيدلة والتمريض",
    category: "faculty",
    lat: 31.832200,
    lng: 35.893200,
    code: "FPHARM",
    description: "Pharmaceutical sciences, pharmacology research labs, and clinical simulation suites.",
    descriptionAr: "مختبرات العلوم الصيدلانية وأبحاث الأدوية ومحاكاة التمريض السريري.",
    openHours: "08:00 AM – 05:00 PM",
    floorCount: 3,
  },
  {
    id: "library",
    name: "Central University Library",
    nameAr: "المكتبة المركزية",
    category: "service",
    lat: 31.832500,
    lng: 35.893600,
    code: "LIB",
    description: "Comprehensive multi-floor research archives, study pods, and digital databases.",
    descriptionAr: "أرشيفات البحث العلمي وقاعات المطالعة الصامتة وقواعد البيانات الإلكترونية.",
    openHours: "07:30 AM – 08:00 PM",
    floorCount: 3,
  },
  {
    id: "reg",
    name: "Deanship of Admission & Registration",
    nameAr: "عمادة القبول والتسجيل",
    category: "admin",
    lat: 31.831800,
    lng: 35.894000,
    code: "REG",
    description: "Official student transcripts, course enrollment support, and academic records.",
    descriptionAr: "كشوف العلامات الرسمية، خدمات تسجيل المواد والوثائق الأكاديمية.",
    openHours: "08:00 AM – 03:30 PM",
    floorCount: 2,
  },
  {
    id: "student_affairs",
    name: "Deanship of Student Affairs",
    nameAr: "عمادة شؤون الطلبة",
    category: "admin",
    lat: 31.832100,
    lng: 35.892100,
    code: "DSA",
    description: "Student clubs, athletic activities, international student bureau, and career guidance.",
    descriptionAr: "الأندية الطلابية والنشاطات الرياضية ومكتب رعاية الطلبة الوافدين.",
    openHours: "08:00 AM – 03:00 PM",
    floorCount: 2,
  },
  {
    id: "main_gate",
    name: "University Main Entrance Gate",
    nameAr: "البوابة الرئيسية والحرم الجامعي",
    category: "service",
    lat: 31.830800,
    lng: 35.894800,
    code: "GATE-1",
    description: "Primary vehicular and pedestrian entrance off Airport Highway with bus transit stops.",
    descriptionAr: "المدخل الرئيسي للسيارات والمشاة من طريق المطار ومحطة حافلات الجامعة.",
    openHours: "24/7 Security",
    floorCount: 1,
  },
  {
    id: "sports",
    name: "Olympic Sports Complex & Stadium",
    nameAr: "المجمع الرياضي والملاعب الأولمبية",
    category: "sports",
    lat: 31.834200,
    lng: 35.890500,
    code: "SPORT",
    description: "Indoor multi-sport courts, swimming pool, gymnasium, and outdoor soccer stadium.",
    descriptionAr: "الصالة الرياضية المغلقة والمسبح الأولمبي واللياقة البدنية وملاعب كرة القدم.",
    openHours: "08:00 AM – 06:00 PM",
    floorCount: 2,
  },
  {
    id: "cafe",
    name: "Central Student Food Court & Cafeteria",
    nameAr: "مجمع المطاعم والخدمات الطلابية",
    category: "service",
    lat: 31.832700,
    lng: 35.893000,
    code: "CAFE",
    description: "Multi-vendor food court, bookshop, photocopy centers, and shaded terrace seating.",
    descriptionAr: "المطاعم المركزية والخدمات والمكتبة الجامعية والاستراحات الخارجية المظللة.",
    openHours: "07:30 AM – 06:30 PM",
    floorCount: 2,
  },
];

/* ─── Faculty Departments ─── */
const FACULTY_DEPTS = [
  { name: "Computer Science", nameAr: "علوم الحاسوب", code: "CS", students: 840, head: "Dr. Ahmad Khalil", room: "IT-214" },
  { name: "Software Engineering", nameAr: "هندسة البرمجيات", code: "SE", students: 510, head: "Dr. Sara Mahmoud", room: "IT-216" },
  { name: "Artificial Intelligence & Data Science", nameAr: "الذكاء الاصطناعي وعلم البيانات", code: "AI", students: 290, head: "Dr. Omar Hassan", room: "IT-218" },
  { name: "Cybersecurity & Networks", nameAr: "الأمن السيبراني والشبكات", code: "CY", students: 430, head: "Dr. Reem Mansour", room: "IT-220" },
];

/* ─── Faculty Directory ─── */
const FACULTY_DIRECTORY = [
  { title: "Dean of IT Faculty", name: "Prof. Ahmad Al-Khatib", role: "Dean", floor: 2, room: "IT-201", icon: GraduationCap },
  { title: "Head of Academic Advising", name: "Dr. Ahmad Khalil", role: "Professor", floor: 2, room: "IT-214", icon: UserCircle },
  { title: "Head of Software Engineering", name: "Dr. Sara Mahmoud", role: "Associate Professor", floor: 2, room: "IT-216", icon: Layers },
  { title: "Head of AI Department", name: "Dr. Omar Hassan", role: "Assistant Professor", floor: 2, room: "IT-218", icon: BrainCircuit },
  { title: "Cybersecurity Coordinator", name: "Dr. Reem Mansour", role: "Lecturer", floor: 2, room: "IT-220", icon: ShieldCheck },
  { title: "Senior Systems Advisor", name: "Dr. Tariq Nabulsi", role: "Advisor", floor: 1, room: "IT-109", icon: Monitor },
  { title: "Algorithms & DS Lab Supervisor", name: "Eng. Noor Al-Zoubi", role: "Lab Supervisor", floor: 1, room: "IT-LAB1", icon: FlaskConical },
  { title: "Networks Lab Supervisor", name: "Eng. Hamza Qasem", role: "Lab Supervisor", floor: 1, room: "IT-LAB2", icon: Wifi },
];

/* ─── Student Services ─── */
const STUDENT_SERVICES = [
  { name: "Faculty Registration Desk", nameAr: "مكتب التسجيل بالكلية", floor: 0, room: "G-01", icon: BookOpen, hours: "8:00 AM – 3:30 PM" },
  { name: "IT Faculty Support Desk", nameAr: "الدعم الفني والشبكات", floor: 0, room: "G-03", icon: Monitor, hours: "8:00 AM – 4:00 PM" },
  { name: "IT Faculty Study Library", nameAr: "مكتبة ومطالعة الكلية", floor: 1, room: "IT-102", icon: BookOpen, hours: "7:30 AM – 7:00 PM" },
  { name: "Olive Grove Student Cafeteria", nameAr: "كافيتيريا حديقة الزيتون", floor: 0, room: "G-Cafe", icon: MapPin, hours: "7:00 AM – 6:00 PM" },
  { name: "Prayer Hall (Men & Women)", nameAr: "المصلى المركزي", floor: 0, room: "G-PA", icon: Compass, hours: "Open 24/7" },
];

/* ─── Emergency & Accessibility ─── */
const EMERGENCY_INFO = [
  { label: "Main Emergency Exit", location: "Ground Floor — East Wing Walkway", icon: AlertTriangle, color: "text-red-400" },
  { label: "Secondary Emergency Exit", location: "First Floor — West Fire Escape Staircase", icon: AlertTriangle, color: "text-red-400" },
  { label: "Elevator A (Wheelchair Accessible)", location: "Ground Floor — Central Reception Lobby", icon: Accessibility, color: "text-emerald-400" },
  { label: "Elevator B (Lab Wing)", location: "First Floor — Adjacent to AI & SE Labs", icon: Accessibility, color: "text-emerald-400" },
  { label: "Campus Security Station", location: "Ground Floor — Main Entrance Portico", icon: ShieldCheck, color: "text-emerald-400" },
  { label: "University Medical Clinic & Ambulance", location: "+962 6 429 1511 ext. 9911 / Clinic Bldg B", icon: Phone, color: "text-emerald-400" },
];

/* ─── Geodesic Haversine Distance (in meters) ─── */
function calculateDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3;
  const p1 = (lat1 * Math.PI) / 180;
  const p2 = (lat2 * Math.PI) / 180;
  const dp = ((lat2 - lat1) * Math.PI) / 180;
  const dl = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dp / 2) * Math.sin(dp / 2) +
    Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) * Math.sin(dl / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

export default function CampusNavigation() {
  const { t, language } = useI18n();
  const { user } = useAuth();

  /* ─── State ─── */
  const [activeTab, setActiveTab] = useState("overview");
  const [activeFloor, setActiveFloor] = useState(0);
  const [filterType, setFilterType] = useState<string>("all");
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Interactive Map State
  const [selectedLandmark, setSelectedLandmark] = useState<CampusLandmark>(CAMPUS_LANDMARKS[0]);
  const [mapMode, setMapMode] = useState<"roadmap" | "satellite" | "terrain">("roadmap");
  const [zoomLevel, setZoomLevel] = useState<number>(18);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  // Route Planning State
  const [routeOrigin, setRouteOrigin] = useState<string>("main_gate");
  const [routeDest, setRouteDest] = useState<string>("fsit");

  /* ─── Queries ─── */
  const { data: campus, isLoading: campusLoading } = trpc.navigation.campus.useQuery();
  const { data: todaySchedule } = trpc.student.todaySchedule.useQuery(
    undefined,
    { enabled: user?.role === "student", retry: false }
  );

  const buildings = campus?.buildings ?? [];
  const rooms = campus?.rooms ?? [];
  const facultyBuilding = buildings[0] ?? {
    id: 1,
    name: "Faculty of Science & IT",
    lat: 31.8328215,
    lng: 35.8925197,
  };

  const classroomCount = rooms.filter(r => r.type === "classroom" || r.type === "lecture_hall").length;
  const labCount = rooms.filter(r => r.type === "lab").length;
  const officeCount = rooms.filter(r => r.type === "office").length;
  const floorRooms = rooms.filter(r => r.floor === activeFloor);

  /* ─── Geolocation Handler ─── */
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(coords);
        
        const dist = calculateDistanceMeters(coords.lat, coords.lng, selectedLandmark.lat, selectedLandmark.lng);
        toast.success(`Location identified! You are ~${dist}m from ${selectedLandmark.name}.`);
      },
      (err) => {
        setIsLocating(false);
        toast.error("Unable to retrieve device GPS: " + err.message);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  /* ─── Open Google Maps External Services ─── */
  const openGoogleDirections = (destinationLat: number, destinationLng: number, landmarkName?: string) => {
    let url = `https://www.google.com/maps/dir/?api=1&destination=${destinationLat},${destinationLng}&travelmode=walking`;
    if (userLocation) {
      url += `&origin=${userLocation.lat},${userLocation.lng}`;
    }
    window.open(url, "_blank");
  };

  const openGoogleStreetView = (lat: number, lng: number) => {
    window.open(`https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${lat},${lng}`, "_blank");
  };

  const openGoogleSearch = (query: string) => {
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent("Al-Zaytoonah University of Jordan " + query)}`, "_blank");
  };

  /* ─── Computed Distance to Selected Landmark ─── */
  const distanceToSelected = useMemo(() => {
    if (!userLocation) return null;
    return calculateDistanceMeters(userLocation.lat, userLocation.lng, selectedLandmark.lat, selectedLandmark.lng);
  }, [userLocation, selectedLandmark]);

  /* ─── Route Planner Calculation ─── */
  const routeCalculation = useMemo(() => {
    const originL = CAMPUS_LANDMARKS.find(l => l.id === routeOrigin) || CAMPUS_LANDMARKS[6]; // main gate default
    const destL = CAMPUS_LANDMARKS.find(l => l.id === routeDest) || CAMPUS_LANDMARKS[0]; // fsit default

    const distanceMeters = calculateDistanceMeters(originL.lat, originL.lng, destL.lat, destL.lng);
    const walkMinutes = Math.max(1, Math.round(distanceMeters / 75)); // ~75m per minute on campus

    return {
      origin: originL,
      dest: destL,
      distanceMeters,
      walkMinutes,
      steps: [
        { desc: `Depart from ${originL.name} (${originL.nameAr})`, icon: Footprints, eta: "0 min", distance: "0m" },
        { desc: "Follow the paved central campus walkway toward the Olive Grove Plaza", icon: Navigation2, eta: "2 min", distance: `${Math.round(distanceMeters * 0.4)}m` },
        { desc: `Approach entrance of ${destL.name}`, icon: Building2, eta: `${Math.max(1, walkMinutes - 1)} min`, distance: `${Math.round(distanceMeters * 0.85)}m` },
        { desc: `Arrive at destination: ${destL.code} reception desk`, icon: CheckCircle2, eta: `${walkMinutes} min`, distance: `${distanceMeters}m` },
      ]
    };
  }, [routeOrigin, routeDest]);

  /* ─── Dynamic Google Maps Embed URL ─── */
  const mapEmbedUrl = useMemo(() => {
    // Map mode token for standard embed: 'm' = roadmap, 'k' = satellite, 'p' = terrain, 'h' = hybrid
    const modeChar = mapMode === "satellite" ? "k" : mapMode === "terrain" ? "p" : "m";
    return `https://maps.google.com/maps?q=${selectedLandmark.lat},${selectedLandmark.lng}&t=${modeChar}&z=${zoomLevel}&output=embed`;
  }, [selectedLandmark, mapMode, zoomLevel]);

  const filteredRooms = useMemo(() => {
    return rooms.filter(room => {
      const matchType = filterType === "all" || room.type === filterType;
      const matchSearch =
        searchQuery === "" ||
        room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        room.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (room.nameAr && room.nameAr.includes(searchQuery));
      return matchType && matchSearch;
    });
  }, [rooms, filterType, searchQuery]);

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* Header Ribbon */}
        <motion.div variants={fadeInUp} initial="initial" animate="animate" className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Al-Zaytoonah University of Jordan • Smart Campus GIS</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Campus Navigation & Wayfinding
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                Interactive satellite positioning, building directories, lecture wayfinding, and indoor floor maps.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <Button
                variant="outline"
                className="border-emerald-500/30 bg-emerald-950/20 hover:bg-emerald-900/40 text-emerald-300 h-10 px-4"
                onClick={handleLocateMe}
                disabled={isLocating}
              >
                <LocateFixed className={`w-4 h-4 me-2 ${isLocating ? "animate-spin text-amber-300" : "text-emerald-400"}`} />
                {isLocating ? "Acquiring GPS..." : "Find My Location"}
              </Button>
              <Button
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold h-10 px-4 shadow-lg shadow-emerald-900/30"
                onClick={() => openGoogleDirections(selectedLandmark.lat, selectedLandmark.lng, selectedLandmark.name)}
              >
                <Navigation className="w-4 h-4 me-2" />
                Google Directions
              </Button>
              <Button
                variant="outline"
                className="border-white/15 bg-white/5 hover:bg-white/10 text-white h-10 px-4"
                onClick={() => window.open("https://vt.zuj.edu.jo/", "_blank")}
              >
                <Video className="w-4 h-4 me-2 text-amber-400" />
                360° Virtual Tour
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Campus KPI Metrics */}
        <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
          {[
            { icon: Building2, label: "Campus POIs", value: CAMPUS_LANDMARKS.length, color: "text-emerald-400", sub: "Interactive Landmarks" },
            { icon: Monitor, label: "Classrooms & Halls", value: classroomCount > 0 ? classroomCount : 24, color: "text-emerald-400", sub: "Fully Air Conditioned" },
            { icon: FlaskConical, label: "Specialized Labs", value: labCount > 0 ? labCount : 12, color: "text-amber-400", sub: "AI, SE & Cyber Suites" },
            { icon: Users, label: "Faculty Offices", value: officeCount > 0 ? officeCount : 18, color: "text-violet-400", sub: "Advisors & Department Heads" },
          ].map((stat, i) => (
            <motion.div key={i} variants={fadeInUp}>
              <Card className="bg-slate-900/80 border-emerald-500/20 backdrop-blur-xl shadow-lg">
                <CardContent className="p-4 flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white tracking-tight">{stat.value}</p>
                    <p className="text-xs font-semibold text-slate-300">{stat.label}</p>
                    <p className="text-[10px] text-slate-500">{stat.sub}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Main Tab System */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-slate-900/90 border border-emerald-500/20 p-1.5 flex-wrap h-auto gap-1 rounded-2xl shadow-lg">
            {[
              { id: "overview", label: "Interactive GIS Map", icon: Map },
              { id: "routes", label: "Route Planner", icon: Route },
              { id: "building", label: "Floor Directory", icon: Layers },
              { id: "lectures", label: "Today's Schedule", icon: CalendarDays },
              { id: "staff", label: "Faculty & Advisors", icon: Users },
              { id: "services", label: "Campus Services", icon: MapPin },
              { id: "emergency", label: "Safety & Exits", icon: AlertTriangle },
            ].map(tab => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-md"
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* ═════════════════════════════════════════════════════ */}
          {/* TAB 1: INTERACTIVE GOOGLE MAPS & LANDMARK EXPLORER  */}
          {/* ═════════════════════════════════════════════════════ */}
          <TabsContent value="overview" className="mt-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column: Landmark Selector & Live Telemetry */}
              <motion.div variants={fadeInUp} initial="initial" animate="animate" className="lg:col-span-1 space-y-4">
                
                {/* Active Landmark Card */}
                <Card className="bg-slate-900/80 border-emerald-500/30 backdrop-blur-xl shadow-xl overflow-hidden">
                  <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-green-400 to-amber-400" />
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 font-mono">
                        {selectedLandmark.code}
                      </span>
                      <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[10px]">
                        {selectedLandmark.category.toUpperCase()}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl font-bold text-white mt-1">
                      {selectedLandmark.name}
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-400">
                      {selectedLandmark.nameAr}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4 text-xs">
                    <p className="text-slate-300 leading-relaxed">
                      {selectedLandmark.description}
                    </p>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                        <p className="text-[10px] text-slate-500 font-medium">Visiting Hours</p>
                        <p className="text-xs font-semibold text-white mt-0.5">{selectedLandmark.openHours}</p>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                        <p className="text-[10px] text-slate-500 font-medium">Building Levels</p>
                        <p className="text-xs font-semibold text-white mt-0.5">{selectedLandmark.floorCount} Floors</p>
                      </div>
                    </div>

                    {/* Geolocation Proximity Alert */}
                    {distanceToSelected !== null && (
                      <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-emerald-300">
                          <LocateFixed className="w-4 h-4 text-emerald-400" />
                          <span className="font-semibold text-xs">Your Proximity:</span>
                        </div>
                        <span className="text-xs font-bold text-white bg-emerald-600/40 px-2 py-0.5 rounded-md">
                          {distanceToSelected > 1000 ? `${(distanceToSelected / 1000).toFixed(1)} km` : `${distanceToSelected} meters`}
                        </span>
                      </div>
                    )}

                    {/* Action Deep Links */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs h-9"
                        onClick={() => openGoogleDirections(selectedLandmark.lat, selectedLandmark.lng, selectedLandmark.name)}
                      >
                        <Navigation className="w-3.5 h-3.5 me-1.5" />
                        Navigate
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 border-white/15 bg-white/5 hover:bg-white/10 text-slate-200 text-xs h-9"
                        onClick={() => openGoogleStreetView(selectedLandmark.lat, selectedLandmark.lng)}
                      >
                        <Eye className="w-3.5 h-3.5 me-1.5 text-amber-400" />
                        Street View
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Landmark Quick Switcher */}
                <Card className="bg-slate-900/80 border-white/10 backdrop-blur-xl">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-emerald-400" />
                      Select Campus Landmark
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1.5 max-h-[300px] overflow-y-auto pe-1">
                    {CAMPUS_LANDMARKS.map((landmark) => {
                      const isSelected = selectedLandmark.id === landmark.id;
                      return (
                        <button
                          key={landmark.id}
                          onClick={() => {
                            setSelectedLandmark(landmark);
                            toast.info(`Map focused on ${landmark.name}`);
                          }}
                          className={`w-full text-start p-2.5 rounded-xl border transition-all flex items-center justify-between text-xs ${
                            isSelected
                              ? "bg-emerald-700/25 border-emerald-500/50 text-white shadow-sm"
                              : "bg-white/[0.02] border-white/5 text-slate-300 hover:bg-white/[0.06] hover:text-white"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <span className={`w-2 h-2 rounded-full ${isSelected ? "bg-emerald-400 animate-pulse" : "bg-slate-600"}`} />
                            <div className="truncate">
                              <p className="font-semibold truncate">{landmark.name}</p>
                              <p className="text-[10px] text-slate-500 truncate">{landmark.nameAr}</p>
                            </div>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0 rtl:rotate-180" />
                        </button>
                      );
                    })}
                  </CardContent>
                </Card>

              </motion.div>

              {/* Right Column: Interactive Map Canvas */}
              <motion.div variants={fadeInUp} initial="initial" animate="animate" className="lg:col-span-2">
                <Card className="bg-slate-900/90 border-emerald-500/20 backdrop-blur-xl shadow-2xl flex flex-col h-full min-h-[580px]">
                  
                  {/* Map Controls Header */}
                  <div className="p-4 border-b border-white/10 flex flex-wrap items-center justify-between gap-3 bg-slate-950/40">
                    <div className="flex items-center gap-2">
                      <Map className="w-5 h-5 text-emerald-400" />
                      <div>
                        <h3 className="font-bold text-sm text-white flex items-center gap-2">
                          Live Satellite & Campus GIS Map
                          <span className="text-[10px] px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            High Resolution
                          </span>
                        </h3>
                        <p className="text-[11px] text-slate-400">
                          Coords: {selectedLandmark.lat.toFixed(6)}°N, {selectedLandmark.lng.toFixed(6)}°E
                        </p>
                      </div>
                    </div>

                    {/* Mode and Zoom Controls */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-white/10">
                        <button
                          onClick={() => setMapMode("roadmap")}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${mapMode === "roadmap" ? "bg-emerald-600 text-white shadow" : "text-slate-400 hover:text-white"}`}
                        >
                          Roadmap
                        </button>
                        <button
                          onClick={() => setMapMode("satellite")}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${mapMode === "satellite" ? "bg-emerald-600 text-white shadow" : "text-slate-400 hover:text-white"}`}
                        >
                          Satellite
                        </button>
                        <button
                          onClick={() => setMapMode("terrain")}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${mapMode === "terrain" ? "bg-emerald-600 text-white shadow" : "text-slate-400 hover:text-white"}`}
                        >
                          Terrain
                        </button>
                      </div>

                      <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-white/10">
                        <button
                          onClick={() => setZoomLevel(prev => Math.min(20, prev + 1))}
                          className="px-2 py-1 text-slate-300 hover:text-white text-xs font-bold"
                          title="Zoom In"
                        >
                          +
                        </button>
                        <span className="text-[10px] font-mono px-1.5 text-slate-400">{zoomLevel}x</span>
                        <button
                          onClick={() => setZoomLevel(prev => Math.max(14, prev - 1))}
                          className="px-2 py-1 text-slate-300 hover:text-white text-xs font-bold"
                          title="Zoom Out"
                        >
                          -
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Clean, Full-Fidelity Map Embed Canvas (No Inverted Filter) */}
                  <div className="flex-1 w-full relative min-h-[460px] bg-slate-950">
                    <iframe
                      title="Google Maps Campus GIS View"
                      width="100%"
                      height="100%"
                      style={{ border: 0, minHeight: "460px" }}
                      loading="lazy"
                      allowFullScreen
                      referrerPolicy="no-referrer-when-downgrade"
                      src={mapEmbedUrl}
                      className="w-full h-full"
                    />

                    {/* Floating Map Actions Badge */}
                    <div className="absolute bottom-4 start-4 bg-slate-950/85 border border-white/15 backdrop-blur-md px-3 py-2 rounded-xl text-xs text-white shadow-xl flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                        <span className="font-semibold">{selectedLandmark.name}</span>
                      </div>
                      <span className="text-slate-500">|</span>
                      <button
                        onClick={() => openGoogleSearch(selectedLandmark.name)}
                        className="text-emerald-400 hover:underline flex items-center gap-1 font-medium"
                      >
                        Search Nearby Places <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </Card>
              </motion.div>

            </div>
          </TabsContent>

          {/* ═════════════════════════════════════════════════════ */}
          {/* TAB 2: TURN-BY-TURN CAMPUS ROUTE PLANNER            */}
          {/* ═════════════════════════════════════════════════════ */}
          <TabsContent value="routes" className="mt-6 space-y-6">
            <Card className="bg-slate-900/80 border-emerald-500/20 backdrop-blur-xl shadow-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                      <Route className="w-5 h-5 text-emerald-400" />
                      Smart Campus Route Planner & ETA Calculator
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-400 mt-1">
                      Calculates walking path distance, floor transitions, and time estimates across Al-Zaytoonah campus.
                    </CardDescription>
                  </div>
                  <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-xs py-1">
                    Pedestrian Optimized
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                
                {/* Route Selector Controls */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-950/60 border border-white/10">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                      <Crosshair className="w-3.5 h-3.5" />
                      Starting Origin Point
                    </label>
                    <select
                      value={routeOrigin}
                      onChange={(e) => setRouteOrigin(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    >
                      {CAMPUS_LANDMARKS.map(l => (
                        <option key={l.id} value={l.id}>{l.name} ({l.code})</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" />
                      Target Destination
                    </label>
                    <select
                      value={routeDest}
                      onChange={(e) => setRouteDest(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    >
                      {CAMPUS_LANDMARKS.map(l => (
                        <option key={l.id} value={l.id}>{l.name} ({l.code})</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Calculated Route Summary Card */}
                <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-slate-900/80 to-slate-900/90 border border-emerald-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
                      <Footprints className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <span>{routeCalculation.origin.name}</span>
                        <ChevronRight className="w-4 h-4 text-emerald-400 rtl:rotate-180" />
                        <span>{routeCalculation.dest.name}</span>
                      </h4>
                      <p className="text-xs text-slate-300 mt-1">
                        Paved campus pathway • Step-free wheelchair friendly
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-end">
                      <p className="text-xl font-extrabold text-emerald-400">
                        {routeCalculation.walkMinutes} min
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {routeCalculation.distanceMeters} meters
                      </p>
                    </div>
                    <Button
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs h-10 px-4"
                      onClick={() => openGoogleDirections(routeCalculation.dest.lat, routeCalculation.dest.lng)}
                    >
                      <Navigation className="w-4 h-4 me-1.5" />
                      Live GPS Walk
                    </Button>
                  </div>
                </div>

                {/* Step-by-Step Wayfinding Breadcrumbs */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Turn-by-Turn Waypoints ({routeCalculation.steps.length})
                  </h4>
                  <div className="space-y-2">
                    {routeCalculation.steps.map((step, idx) => {
                      const Icon = step.icon;
                      return (
                        <div key={idx} className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.03] border border-white/5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center shrink-0">
                              <Icon className="w-4 h-4 text-emerald-400" />
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-white">{step.desc}</p>
                              <p className="text-[10px] text-slate-400">Waypoint {idx + 1} • Cumulative: {step.distance}</p>
                            </div>
                          </div>
                          <span className="text-xs font-mono text-emerald-300 bg-slate-900/80 px-2 py-1 rounded-lg">
                            {step.eta}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </CardContent>
            </Card>
          </TabsContent>

          {/* ═════════════════════════════════════════════════════ */}
          {/* TAB 3: FLOOR-BY-FLOOR INDOOR DIRECTORY              */}
          {/* ═════════════════════════════════════════════════════ */}
          <TabsContent value="building" className="mt-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              
              {/* Floor Selector Card */}
              <div className="lg:col-span-1 space-y-4">
                <Card className="bg-slate-900/80 border-emerald-500/20 backdrop-blur-xl">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                      <Layers className="w-4 h-4 text-emerald-400" />
                      Faculty of IT Levels
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-400">
                      Explore 3 active floors and laboratories.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {[
                      { floor: 0, label: "Ground Floor", labelAr: "الطابق الأرضي", desc: "Main Lobby, Reception, Cafeteria, Prayer Hall" },
                      { floor: 1, label: "First Floor", labelAr: "الطابق الأول", desc: "Computer Labs (1-4), Faculty Library, Classrooms" },
                      { floor: 2, label: "Second Floor", labelAr: "الطابق الثاني", desc: "Dean Office, Department Heads, Advisor Offices" },
                    ].map(f => (
                      <button
                        key={f.floor}
                        onClick={() => setActiveFloor(f.floor)}
                        className={`w-full text-start p-3 rounded-xl border transition-all ${
                          activeFloor === f.floor
                            ? "bg-emerald-700/20 border-emerald-500/50 text-white shadow-md"
                            : "bg-white/[0.02] border-white/5 text-slate-300 hover:bg-white/[0.06]"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs">{f.label}</span>
                          <span className="text-[10px] text-slate-500">{f.labelAr}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1">{f.desc}</p>
                      </button>
                    ))}
                  </CardContent>
                </Card>

                {/* Filter by Room Type */}
                <Card className="bg-slate-900/80 border-white/10 backdrop-blur-xl">
                  <CardContent className="p-3.5 space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Filter By Room Category</p>
                    <div className="flex flex-wrap gap-1.5">
                      {["all", "classroom", "lab", "office", "lecture_hall"].map(type => (
                        <button
                          key={type}
                          onClick={() => setFilterType(type)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium capitalize border transition-all ${
                            filterType === type
                              ? "bg-emerald-600 border-emerald-500 text-white"
                              : "bg-white/[0.03] border-white/5 text-slate-400 hover:text-white"
                          }`}
                        >
                          {type.replace("_", " ")}
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Floor Rooms Grid */}
              <div className="lg:col-span-3 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <DoorOpen className="w-4 h-4 text-emerald-400" />
                    <span>Rooms on Floor {activeFloor} ({floorRooms.length})</span>
                  </h3>
                  <div className="w-64">
                    <Input
                      placeholder="Search room name or code..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-8 text-xs bg-slate-950/60 border-slate-700 text-white placeholder-slate-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                  {floorRooms.length > 0 ? (
                    floorRooms.map(room => (
                      <Card
                        key={room.id}
                        onClick={() => setSelectedRoom(room)}
                        className={`bg-slate-900/80 border transition-all cursor-pointer hover:bg-slate-800/80 ${
                          selectedRoom?.id === room.id ? "border-emerald-500 shadow-md shadow-emerald-900/20" : "border-white/5"
                        }`}
                      >
                        <CardContent className="p-3.5 flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs text-white">{room.roomNumber}</span>
                              <Badge className="bg-emerald-500/15 text-emerald-300 text-[9px] border-emerald-500/30">
                                {room.type}
                              </Badge>
                            </div>
                            <p className="text-xs font-medium text-slate-200 mt-1">{room.name}</p>
                            <p className="text-[10px] text-slate-500">{room.nameAr}</p>
                            <p className="text-[10px] text-slate-400 mt-2">Capacity: {room.capacity} students</p>
                          </div>
                          <Button
                            size="sm"
                            className="h-7 px-2.5 bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 text-[10px]"
                            onClick={(e) => {
                              e.stopPropagation();
                              openGoogleDirections(facultyBuilding.lat, facultyBuilding.lng, room.name);
                            }}
                          >
                            Route
                          </Button>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="col-span-3 text-center py-12 text-slate-500">
                      <DoorOpen className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      <p className="text-xs">No rooms found matching your filter on this floor.</p>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </TabsContent>

          {/* ═════════════════════════════════════════════════════ */}
          {/* TAB 4: TODAY'S LECTURES & SCHEDULE WAYFINDING       */}
          {/* ═════════════════════════════════════════════════════ */}
          <TabsContent value="lectures" className="mt-6 space-y-6">
            <Card className="bg-slate-900/80 border-emerald-500/20 backdrop-blur-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                      <CalendarDays className="w-5 h-5 text-emerald-400" />
                      Today's Lecture Schedule & Navigation
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-400 mt-1">
                      Direct 1-click room wayfinding for all active class sessions today.
                    </CardDescription>
                  </div>
                  <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                    Live Timetable
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                {todaySchedule && todaySchedule.length > 0 ? (
                  todaySchedule.map((lecture) => (
                    <div
                      key={lecture.id}
                      className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="flex items-start gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
                          <GraduationCap className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="text-sm font-bold text-white">{lecture.courseName}</h4>
                            <Badge className="bg-emerald-500/20 text-emerald-300 text-[10px] font-mono">
                              {lecture.courseCode}
                            </Badge>
                            {((lecture as any).modalityLabel || (lecture as any).modality) && (
                              <Badge className={`text-[10px] ${
                                (lecture as any).modality === "teams"
                                  ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/30"
                                  : (lecture as any).modality === "integrated"
                                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                                  : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                              }`}>
                                {(lecture as any).modalityLabel || "Face-to-Face"}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-slate-300 mt-1">Instructor: {lecture.lecturerName}</p>
                          <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-400">
                            <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-amber-400" />{lecture.startTime} – {lecture.endTime}</span>
                            <span className="flex items-center gap-1.5"><DoorOpen className="w-3.5 h-3.5 text-emerald-400" />{lecture.roomName ?? "Hall B-104"}</span>
                            <span className="flex items-center gap-1.5"><ArrowUpDown className="w-3.5 h-3.5 text-emerald-400" />Floor {lecture.floor ?? 1}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 shrink-0">
                        <Button
                          className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs h-9 px-4"
                          onClick={() => {
                            if (lecture.floor != null) {
                              setActiveFloor(lecture.floor);
                              setActiveTab("building");
                            }
                          }}
                        >
                          <Navigation className="w-3.5 h-3.5 me-1.5" />
                          View Room
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-slate-500">
                    <CalendarDays className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p className="text-sm font-semibold text-slate-300">No on-campus lectures scheduled for today.</p>
                    <p className="text-xs text-slate-500 mt-1">Al-Zaytoonah University follows a 4-day academic week (Sunday – Wednesday). Thursday, Friday, and Saturday are lecture-free study and e-learning activity days.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ═════════════════════════════════════════════════════ */}
          {/* TAB 5: FACULTY ADVISORS & DEAN DIRECTORY            */}
          {/* ═════════════════════════════════════════════════════ */}
          <TabsContent value="staff" className="mt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {FACULTY_DIRECTORY.map((entry, idx) => {
                const Icon = entry.icon;
                return (
                  <Card key={idx} className="bg-slate-900/80 border-white/5 hover:border-emerald-500/30 transition-all">
                    <CardContent className="p-4 flex items-start gap-3.5">
                      <div className="w-11 h-11 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-white truncate">{entry.name}</p>
                        <p className="text-[11px] text-emerald-400">{entry.title}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                          <span className="flex items-center gap-1"><DoorOpen className="w-3.5 h-3.5" />Room {entry.room}</span>
                          <span className="flex items-center gap-1"><ArrowUpDown className="w-3.5 h-3.5" />Floor {entry.floor}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* ═════════════════════════════════════════════════════ */}
          {/* TAB 6: CAMPUS SERVICES & STUDENT HUBS               */}
          {/* ═════════════════════════════════════════════════════ */}
          <TabsContent value="services" className="mt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {STUDENT_SERVICES.map((service, idx) => {
                const Icon = service.icon;
                return (
                  <Card key={idx} className="bg-slate-900/80 border-white/5 hover:border-emerald-500/30 transition-all">
                    <CardContent className="p-5 flex items-start gap-4">
                      <div className="w-11 h-11 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{service.name}</p>
                        <p className="text-xs text-slate-400">{service.nameAr}</p>
                        <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-400">
                          <span className="flex items-center gap-1"><DoorOpen className="w-3.5 h-3.5 text-emerald-400" />{service.room}</span>
                          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-amber-400" />{service.hours}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* ═════════════════════════════════════════════════════ */}
          {/* TAB 7: SAFETY, EXITS & CLINIC CONTACTS              */}
          {/* ═════════════════════════════════════════════════════ */}
          <TabsContent value="emergency" className="mt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {EMERGENCY_INFO.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <Card key={idx} className="bg-slate-900/80 border-white/5 hover:border-red-500/30 transition-all">
                    <CardContent className="p-4 flex items-start gap-3.5">
                      <div className="w-11 h-11 rounded-xl bg-slate-800 flex items-center justify-center shrink-0">
                        <Icon className={`w-5 h-5 ${item.color}`} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{item.label}</p>
                        <p className="text-xs text-slate-400 mt-1">{item.location}</p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <Card className="bg-gradient-to-r from-red-950/40 to-slate-900/90 border border-red-500/30">
              <CardContent className="p-5 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Campus Assembly Point & Emergency Protocol</h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    In the event of an alarm or building evacuation, please exit in an orderly fashion using the marked stairwells. 
                    Do NOT use elevators during fire alarms. The primary designated safe assembly point is the <strong>Central Olive Grove Courtyard</strong>.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </div>
    </DashboardLayout>
  );
}

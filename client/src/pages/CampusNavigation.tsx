import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Navigation, Search, Building2, DoorOpen } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 },
};

export default function CampusNavigation() {
  const { t } = useI18n();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBuilding, setSelectedBuilding] = useState<any>(null);
  const [selectedClassroom, setSelectedClassroom] = useState<any>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const { data: campus } = trpc.navigation.campus.useQuery();
  const buildings = campus?.buildings ?? [];
  const classrooms = campus?.rooms ?? [];

  // Filter buildings and classrooms
  const filteredBuildings = buildings.filter(
    b =>
      b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredClassrooms = classrooms.filter(
    c =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.building ?? "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <motion.div
          initial="initial"
          animate="animate"
          variants={fadeInUp}
          className="space-y-2"
        >
          <h1 className="text-4xl font-bold">{t("map.title")}</h1>
          <p className="text-slate-500">
            Find buildings, classrooms, and navigate the campus
          </p>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial="initial"
          animate="animate"
          variants={{ animate: { transition: { staggerChildren: 0.1 } } }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {/* Sidebar */}
          <motion.div variants={fadeInUp} className="space-y-4">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  {t("map.searchBuilding")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="bg-slate-700 border-slate-600"
                />

                <Tabs defaultValue="buildings" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-slate-700">
                    <TabsTrigger value="buildings" className="text-xs">
                      Buildings
                    </TabsTrigger>
                    <TabsTrigger value="classrooms" className="text-xs">
                      Classrooms
                    </TabsTrigger>
                  </TabsList>

                  {/* Buildings Tab */}
                  <TabsContent value="buildings" className="space-y-2 mt-4">
                    {filteredBuildings.length > 0 ? (
                      filteredBuildings.map(building => (
                        <button
                          key={building.id}
                          onClick={() => setSelectedBuilding(building)}
                          className={`w-full p-3 rounded-lg text-left transition-colors ${
                            selectedBuilding?.id === building.id
                              ? "bg-blue-600/20 border border-blue-500"
                              : "bg-slate-700/50 hover:bg-slate-700 border border-slate-600"
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-semibold text-sm">
                                {building.name}
                              </p>
                              <p className="text-xs text-slate-400">
                                {building.code}
                              </p>
                            </div>
                            <Building2 className="w-4 h-4 text-blue-400" />
                          </div>
                        </button>
                      ))
                    ) : (
                      <p className="text-slate-400 text-sm text-center py-4">
                        {t("common.noResults")}
                      </p>
                    )}
                  </TabsContent>

                  {/* Classrooms Tab */}
                  <TabsContent value="classrooms" className="space-y-2 mt-4">
                    {filteredClassrooms.length > 0 ? (
                      filteredClassrooms.map(classroom => (
                        <button
                          key={classroom.id}
                          onClick={() => setSelectedClassroom(classroom)}
                          className={`w-full p-3 rounded-lg text-left transition-colors ${
                            selectedClassroom?.id === classroom.id
                              ? "bg-blue-600/20 border border-blue-500"
                              : "bg-slate-700/50 hover:bg-slate-700 border border-slate-600"
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-semibold text-sm">
                                {classroom.name}
                              </p>
                              <p className="text-xs text-slate-400">
                                {classroom.building}
                              </p>
                            </div>
                            <DoorOpen className="w-4 h-4 text-purple-400" />
                          </div>
                        </button>
                      ))
                    ) : (
                      <p className="text-slate-400 text-sm text-center py-4">
                        {t("common.noResults")}
                      </p>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Details Card */}
            {selectedBuilding && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="bg-slate-800/50 border-slate-700 border-blue-500/30">
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {selectedBuilding.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-xs text-slate-400">Building Code</p>
                      <p className="font-semibold">{selectedBuilding.code}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Floors</p>
                      <p className="font-semibold">{selectedBuilding.floor}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Capacity</p>
                      <p className="font-semibold">
                        {selectedBuilding.capacity} people
                      </p>
                    </div>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 mt-4">
                      <Navigation className="w-4 h-4 mr-2" />
                      Get Directions
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {selectedClassroom && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="bg-slate-800/50 border-slate-700 border-purple-500/30">
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {selectedClassroom.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-xs text-slate-400">Building</p>
                      <p className="font-semibold">
                        {selectedClassroom.building}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Floor</p>
                      <p className="font-semibold">{selectedClassroom.floor}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Type</p>
                      <p className="font-semibold">{selectedClassroom.type}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Capacity</p>
                      <p className="font-semibold">
                        {selectedClassroom.capacity} seats
                      </p>
                    </div>
                    <Button className="w-full bg-purple-600 hover:bg-purple-700 mt-4">
                      <Navigation className="w-4 h-4 mr-2" />
                      Get Directions
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </motion.div>

          {/* Map Area */}
          <motion.div variants={fadeInUp} className="lg:col-span-2">
            <Card className="bg-slate-800/50 border-slate-700 h-[600px]">
              <CardHeader>
                <CardTitle>Campus Map</CardTitle>
                <CardDescription>Interactive campus navigation</CardDescription>
              </CardHeader>
              <CardContent className="h-[calc(100%-100px)]">
                <div
                  ref={mapRef}
                  className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-800 rounded-lg flex items-center justify-center border border-slate-600 relative overflow-hidden"
                >
                  {/* Placeholder Map */}
                  <div className="text-center space-y-4">
                    <MapPin className="w-16 h-16 text-slate-500 mx-auto" />
                    <div>
                      <p className="text-slate-300 font-semibold">Campus Map</p>
                      <p className="text-slate-400 text-sm">
                        Google Maps integration ready
                      </p>
                    </div>
                  </div>

                  {/* Building Markers */}
                  {buildings.map((building, index) => (
                    <motion.button
                      key={building.id}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => setSelectedBuilding(building)}
                      className={`absolute w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        selectedBuilding?.id === building.id
                          ? "bg-blue-600 scale-125 ring-2 ring-blue-400"
                          : "bg-slate-600 hover:bg-slate-500"
                      }`}
                      style={{
                        left: `${20 + building.id * 12}%`,
                        top: `${30 + building.id * 8}%`,
                      }}
                    >
                      {building.code}
                    </motion.button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Nearby Locations */}
        <motion.div variants={fadeInUp}>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle>Nearby Locations</CardTitle>
              <CardDescription>Popular destinations on campus</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {buildings.map(building => (
                  <button
                    key={building.id}
                    onClick={() => setSelectedBuilding(building)}
                    className="p-4 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors text-left"
                  >
                    <Building2 className="w-6 h-6 text-blue-400 mb-2" />
                    <p className="font-semibold text-sm">{building.name}</p>
                    <p className="text-xs text-slate-400">{building.code}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}

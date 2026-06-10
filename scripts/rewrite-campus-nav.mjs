import fs from "fs";

const file = "client/src/pages/CampusNavigation.tsx";
let src = fs.readFileSync(file, "utf-8");

// Find the end of the Overview tab content
const anchor = src.indexOf("        {/* Main Content */}");
if (anchor === -1) {
  console.error("Could not find anchor point");
  process.exit(1);
}

// Walk back to include the preceding </TabsContent>
let endOfOverview = src.lastIndexOf("</TabsContent>", anchor);
if (endOfOverview === -1) {
  console.error("Could not find </TabsContent>");
  process.exit(1);
}
const prefix = src.slice(0, endOfOverview + "</TabsContent>".length);

const suffix = `

          {/* ── Building Navigation ── */}
          <TabsContent value="building" className="mt-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-1 space-y-4">
                <Card className="bg-white/[0.04] border-white/10 backdrop-blur-2xl">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Stairs className="w-4 h-4 text-blue-400" />
                      Select Floor
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {Array.from({ length: totalFloors }, (_, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveFloor(i)}
                        className={\`w-full p-3 rounded-lg text-left transition-all border \${
                          activeFloor === i
                            ? "bg-blue-600/15 border-blue-500/40 text-white"
                            : "bg-white/[0.03] border-white/5 text-slate-400 hover:bg-white/[0.06]"
                        }\`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{i === 0 ? "Ground Floor" : \`Floor \${i}\`}</span>
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
                          <Card className={\`bg-white/[0.04] border-white/10 backdrop-blur-2xl cursor-pointer hover:bg-white/[0.06] transition-colors \${selectedRoom?.id === room.id ? "ring-1 ring-blue-500/50" : ""}\`} onClick={() => setSelectedRoom(room)}>
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between mb-3">
                                <div className={\`p-2 rounded-lg \${typeColor(room.type)}\`}><Icon className="w-4 h-4" /></div>
                                <Badge variant="outline" className="border-white/10 text-slate-400 text-[10px]">{roomTypeLabel(room.type)}</Badge>
                              </div>
                              <h4 className="text-sm font-semibold text-white">{room.name}</h4>
                              <p className="text-xs text-slate-400 mt-1">Room {room.roomNumber}</p>
                              <div className="flex items-center gap-3 mt-3 text-xs text-slate-500">
                                <span className="flex items-center gap-1"><Users className="w-3 h-3" />{room.capacity}</span>
                                <span className="flex items-center gap-1"><Stairs className="w-3 h-3" />Floor {room.floor}</span>
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
                      <button key={type} onClick={() => setFilterType(type)} className={\`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors \${filterType === type ? "bg-blue-600/20 text-blue-400 border-blue-500/40" : "bg-white/[0.03] text-slate-400 border-white/10 hover:bg-white/[0.06]"}\`}>
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
                            <div className={\`p-2 rounded-lg \${typeColor(room.type)}\`}><Icon className="w-4 h-4" /></div>
                            <Badge variant="outline" className="border-white/10 text-slate-400 text-[10px]">{roomTypeLabel(room.type)}</Badge>
                          </div>
                          <h4 className="text-sm font-semibold text-white">{room.name}</h4>
                          <p className="text-xs text-slate-400 mt-1">Room {room.roomNumber} — {room.building}</p>
                          <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                            <span className="flex items-center gap-1"><Users className="w-3 h-3" />{room.capacity} seats</span>
                            <span className="flex items-center gap-1"><Stairs className="w-3 h-3" />Floor {room.floor}</span>
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
                  {todaySchedule && todaySchedule.length > 0 ? \`\${todaySchedule.length} lecture\${todaySchedule.length > 1 ? "s" : ""} scheduled for today\` : "No lectures scheduled for today"}
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
                            <span className="flex items-center gap-1"><Stairs className="w-3 h-3" />Floor {lecture.floor ?? "—"}</span>
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
                              <span className="flex items-center gap-1"><Stairs className="w-3 h-3" />Floor {entry.floor}</span>
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
                    <button key={key} onClick={() => setSelectedRoute(key)} className={\`p-3 rounded-lg text-left border transition-all \${selectedRoute === key ? "bg-blue-600/15 border-blue-500/40 text-white" : "bg-white/[0.03] border-white/5 text-slate-400 hover:bg-white/[0.06]"}\`}>
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
                                  <span className="flex items-center gap-1"><Stairs className="w-3 h-3" />Floor {step.floor}</span>
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
                            <Icon className={\`w-5 h-5 \${item.color}\`} />
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
`;

fs.writeFileSync(file, prefix + suffix, "utf-8");
console.log("Rewrote", file);

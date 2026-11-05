import fs from "fs";

let c = fs.readFileSync("client/src/components/DashboardLayout.tsx", "utf8");
c = c.replace(/\r\n/g, "\n");

if (!c.includes("formatUniversityId")) {
  c = c.replace(
    'import { useI18n } from "@/contexts/I18nContext";',
    'import { useI18n } from "@/contexts/I18nContext";\nimport { formatUniversityId } from "@/lib/academicUtils";'
  );
}

const oldUserBlock = `                    <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
                      <p className="text-sm font-semibold truncate leading-none text-foreground">
                        {user?.name || "-"}
                      </p>
                      <p className="text-[11px] text-muted-foreground truncate mt-1">
                        {user?.email || "-"}
                      </p>
                    </div>`;

const newUserBlock = `                    <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
                      <p className="text-sm font-semibold truncate leading-none text-foreground">
                        {user?.name || "-"}
                      </p>
                      <p className="text-[10px] font-mono text-emerald-400 font-bold truncate mt-1">
                        ID: {formatUniversityId(user)}
                      </p>
                      <p className="text-[10px] text-muted-foreground truncate">
                        {user?.email || "-"}
                      </p>
                    </div>`;

if (c.includes(oldUserBlock)) {
  c = c.replace(oldUserBlock, newUserBlock);
}

fs.writeFileSync("client/src/components/DashboardLayout.tsx", c);
console.log("Patched client/src/components/DashboardLayout.tsx");

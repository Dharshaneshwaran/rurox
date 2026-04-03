import type { Substitution } from "@/lib/types";
import { cn } from "@/lib/cn";
import { badgeClasses } from "@/components/ui/Badge";
import Button from "@/components/ui/Button";

type SubstitutionListProps = {
  substitutions: Substitution[];
  onAccept?: (id: string) => Promise<void>;
  onReject?: (id: string) => Promise<void>;
  onApproveRejection?: (id: string) => Promise<void>;
  currentTeacherId?: string;
  isAdmin?: boolean;
  loadingId?: string | null;
  onDelete?: (id: string) => Promise<void>;
};

export default function SubstitutionList({
  substitutions,
  onAccept,
  onReject,
  onApproveRejection,
  currentTeacherId,
  isAdmin,
  loadingId,
  onDelete,
}: SubstitutionListProps) {
  if (!substitutions.length) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-slate-100 border border-dashed border-slate-300 rounded-3xl\">
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-700 italic">No Active Deployments Tracked</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {substitutions.map((item) => (
        <article
          key={item.id}
          className="card-reveal group p-6 relative overflow-hidden"
        >
          <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-8">
               <div className="flex flex-col items-center justify-center h-14 w-14 bg-slate-200 border border-slate-300 rounded-2xl group-hover:border-primary/30 transition-colors\">
                  <span className="text-[10px] font-black text-slate-700 uppercase leading-none\">{item.day}</span>
                  <span className="text-[18px] font-black text-slate-900 italic mt-1\">{item.period}</span>
               </div>
               
               <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-700">
                      {new Date(item.date).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                    <div className="h-1 w-1 rounded-full bg-slate-400" />
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary">Node assigned</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 mt-4">
                    <div className="space-y-0.5">
                       <p className="text-[9px] font-black text-slate-700 uppercase tracking-widest">Absent Resource</p>
                       <p className="text-[15px] font-black text-slate-900 tracking-tighter italic\">{item.absentTeacher?.name ?? "NULL"}</p>
                    </div>
                    <div className="h-4 w-px bg-slate-300 hidden sm:block\" />
                    <div className="space-y-0.5">
                       <p className="text-[9px] font-black text-slate-700 uppercase tracking-widest">Replacement Agent</p>
                       <p className="text-[15px] font-black text-primary tracking-tighter italic">{item.replacementTeacher?.name ?? "SCANNING..."}</p>
                    </div>
                  </div>
               </div>
            </div>

            <div className="flex flex-col items-end gap-4 min-w-[140px]">
              <span
                className={badgeClasses({
                  variant: 
                    item.status === "PENDING" ? "warning" :
                    item.status === "REJECTED" ? "danger" :
                    item.status === "REASSIGNED" ? "neutral" :
                    "success",
                })}
              >
                {item.status || "AUTO-SYNC"}
              </span>
              
              <div className="flex flex-wrap items-center justify-end gap-3">
                {onAccept && onReject && item.status === "PENDING" && item.replacementTeacherId === currentTeacherId && (
                  <>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => onReject(item.id)}
                      disabled={loadingId === item.id}
                      className="text-[10px] uppercase font-black tracking-widest"
                    >
                      Refuse
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => onAccept(item.id)}
                      disabled={loadingId === item.id}
                      className="text-[10px] uppercase font-black tracking-widest"
                    >
                      Authorize
                    </Button>
                  </>
                )}
                
                {isAdmin && onApproveRejection && item.status === "REJECTED" && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => onApproveRejection(item.id)}
                    disabled={loadingId === item.id}
                    className="text-[10px] uppercase font-black tracking-widest"
                  >
                    Re-Orchestrate Node
                  </Button>
                )}

                {isAdmin && onDelete && (
                  <button
                    onClick={() => onDelete(item.id)}
                    disabled={loadingId === item.id}
                    className="text-[9px] font-black uppercase tracking-[0.25em] text-red-500/30 hover:text-red-500 transition-colors"
                  >
                    Purge Record
                  </button>
                )}
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

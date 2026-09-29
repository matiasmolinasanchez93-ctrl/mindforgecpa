"use client";

import Link from "next/link";
import { GraduationCap, Puzzle, FileText, Search, Trophy, Flame, Star, Zap } from "lucide-react";
import type { Profile, StudentSkill, ActivityAttempt, StudentAchievement, Achievement } from "@/types";
import { SKILL_DISPLAY_NAMES, xpProgressInLevel, ALL_SKILLS } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { getGreeting } from "@/lib/utils";

interface DashboardViewProps {
  profile: Profile;
  skills: StudentSkill[];
  recentActivity: ActivityAttempt[];
  classes: { class: { id: string; name: string; subject: string } }[];
  achievements: (StudentAchievement & { achievement: Achievement })[];
}

export function DashboardView({ profile, skills, recentActivity, classes, achievements }: DashboardViewProps) {
  if (!profile) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-muted-foreground">Loading your profile...</p>
      </div>
    );
  }

  const name = profile.name?.split(" ")[0] || "Student";
  const xpInfo = xpProgressInLevel(profile.xp || 0);
  const skillMap = new Map(skills.map((s) => [s.skill_name, Number(s.score)]));

  const QUICK_ACTIONS = [
    { href: "/tutor", label: "AI Tutor", icon: GraduationCap, color: "bg-emerald-50 text-emerald-700" },
    { href: "/challenges", label: "Challenges", icon: Puzzle, color: "bg-amber-50 text-amber-700" },
    { href: "/prompt-builder", label: "Prompt Builder", icon: FileText, color: "bg-sky-50 text-sky-700" },
    { href: "/fact-checker", label: "Fact Checker", icon: Search, color: "bg-violet-50 text-violet-700" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {getGreeting()}, {name}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">Keep building your AI skills today.</p>
        </div>
      </div>

      {/* XP Bar */}
      <Card className="bg-zinc-950 text-white">
        <CardContent className="py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
                <Star className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-zinc-400">Level {profile.level}</p>
                <p className="text-2xl font-bold">{profile.xp} XP</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-zinc-400">
              <Flame className="h-5 w-5 text-orange-400" />
              <span className="text-sm font-medium">{profile.streak} day streak</span>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-xs text-zinc-400">
              <span>Level {profile.level}</span>
              <span>{xpInfo.currentLevelXp}/{xpInfo.neededForNext} XP</span>
              <span>Level {profile.level + 1}</span>
            </div>
            <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-emerald-500 transition-all duration-500" style={{ width: `${xpInfo.percent}%` }} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Skills Grid */}
      <section>
        <h2 className="mb-4 text-lg font-semibold tracking-tight">Your Skills</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ALL_SKILLS.map((skillKey) => {
            const score = skillMap.get(skillKey) ?? 50;
            return (
              <Card key={skillKey}>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-zinc-700">{SKILL_DISPLAY_NAMES[skillKey]}</p>
                    <span className="text-sm font-bold text-emerald-600">{Math.round(score)}%</span>
                  </div>
                  <ProgressBar value={score} className="mt-2 h-2" />
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Quick Actions */}
      <section>
        <h2 className="mb-4 text-lg font-semibold tracking-tight">Quick Start</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {QUICK_ACTIONS.map((action) => (
            <Link key={action.href} href={action.href}>
              <Card className="transition-shadow hover:shadow-md cursor-pointer">
                <CardContent className="flex flex-col items-center py-6 text-center">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${action.color}`}>
                    <action.icon className="h-5 w-5" />
                  </div>
                  <p className="mt-3 text-sm font-medium">{action.label}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {recentActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No activity yet. Start a challenge!</p>
            ) : (
              <div className="space-y-3">
                {recentActivity.slice(0, 5).map((a) => (
                  <div key={a.id} className="flex items-center justify-between rounded-xl bg-zinc-50 px-4 py-3">
                    <div>
                      <p className="text-sm font-medium">{a.activity_title || a.activity_type.replace(/_/g, " ")}</p>
                      <p className="text-xs text-zinc-400">{a.subject}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant={a.score >= 70 ? "success" : a.score >= 40 ? "warning" : "muted"}>
                        {Math.round(a.score)}%
                      </Badge>
                      <p className="mt-1 text-xs text-emerald-600">+{a.xp_earned} XP</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Classes & Achievements */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>My Classes</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {classes.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">No classes yet</p>
                  <Link href="/classes" className="mt-2 inline-block">
                    <Button variant="outline" size="sm">Join a Class</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {classes.map((c) => (
                    <div key={c.class.id} className="flex items-center justify-between rounded-xl bg-zinc-50 px-4 py-3">
                      <div>
                        <p className="text-sm font-medium">{c.class.name}</p>
                        <p className="text-xs text-zinc-400">{c.class.subject}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-amber-500" />
                Achievements
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {achievements.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Complete challenges to earn achievements!</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {achievements.map((a) => (
                    <Badge key={a.id} variant="default" className="gap-1">
                      {a.achievement.icon} {a.achievement.name}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

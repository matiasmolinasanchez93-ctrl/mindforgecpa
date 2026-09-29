"use client";

import { useState } from "react";
import { Users, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function JoinClassView() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  async function join() {
    if (!code.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "join", join_code: code.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to join class.");
      toast.success(`Joined "${data.className}"!`);
      setCode("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to join class.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-8">
      <div className="text-center">
        <Users className="mx-auto h-10 w-10 text-emerald-500" />
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">Join a Class</h1>
        <p className="mt-2 text-muted-foreground">Enter the 6-character code your teacher gave you.</p>
      </div>
      <Card>
        <CardContent className="space-y-4 pt-6">
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="e.g. A7K92P"
            className="text-center text-lg font-mono tracking-[0.2em] uppercase"
            maxLength={6}
          />
          <Button onClick={join} loading={loading} disabled={!code.trim()} className="w-full">
            Join Class
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

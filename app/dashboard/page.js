"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const checkUserSession = async () => {
    try {
      const response = await fetch("/api/auth/check-session");
      const result = await response.json();

      if (!response.ok || !result.userExists || result.status === "Blocked") {
        signOut({ callbackUrl: "/login" });
      }
    } catch (error) {
      console.error("Session validation failed", error);
      signOut({ callbackUrl: "/login" });
    }
  };

  const getData = useCallback(async () => {
    try {
      await checkUserSession();

      const response = await fetch("/api/users");
      const result = await response.json();

      const modifiedData = result.map((item) => ({
        ...item,
        lastLogin: formatDistanceToNow(new Date(item.lastLogin)) + " ago",
      }));

      setData(modifiedData);
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated") {
      getData();
    }
  }, [status, getData]);

  if (status === "loading" || loading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="pb-4 flex justify-between items-center">
        <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
          Welcome, {session?.user?.name}
        </h4>

        <Button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="font-bold"
        >
          Logout
        </Button>
      </div>

      <DataTable columns={columns} data={data} refreshData={getData} />
    </div>
  );
}

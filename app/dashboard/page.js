"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { Button } from "@/components/ui/button";

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

  useEffect(() => {
    const getData = async () => {
      try {
        const response = await fetch("/api/users");
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error("Failed to fetch data", error);
      } finally {
        setLoading(false);
      }
    };

    if (status === "authenticated") {
      getData();
    }
  }, [status]);

  if (status === "loading" || loading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto py-10">
      <div className="pb-4 flex justify-between mx-4 items-center">
        <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
          Welcome, {session?.user?.name}
        </h4>

        <Button onClick={() => signOut({ callbackUrl: "/login" })}>
          Logout
        </Button>
      </div>

      <DataTable columns={columns} data={data} />
    </div>
  );
}

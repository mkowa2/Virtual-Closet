"use client";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import { useEffect } from "react";

const HomePage = () => {
  const { user } = useUser();

  useEffect(() => {
    if (user) {
      const addUserToDatabase = async () => {
        const { id, emailAddresses, fullName } = user;
        const email = emailAddresses[0]?.emailAddress;

        try {
          const response = await fetch("/api/addUser", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              clerkId: id,
              email,
              name: fullName,
            }),
          });

          const data = await response.json();
          console.log(data);
        } catch (error) {
          console.error("Failed to add user:", error);
        }
      };

      addUserToDatabase();
    }
  }, [user]);

  return (
    <div className="flex justify-center items-center h-screen">
      {user ? (
        <div>
          <h1>Welcome, {user.fullName || "User"}!</h1>
          <p>Your email is {user.emailAddresses[0]?.emailAddress}</p>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default HomePage;

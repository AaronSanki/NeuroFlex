"use client";

import { api } from "../../../convex/_generated/api";
import { useQuery } from "convex/react";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import CornerElements from "@/components/CornerElements";
import { Button } from "@/components/ui/button";

const LiveWorkoutPage = () => {

  const { user } = useUser();
  const [exercise, setExercise] = useState("--");
  const [reps, setReps] = useState(0);
  const [angle, setAngle] = useState("--");
  const [calories, setCalories] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const userBMI = useQuery(api.users.getUserBMI, { clerkId: user?.id as string });

  const startWorkout = async () => {
    try {
      await fetch("http://127.0.0.1:5000/login", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: user?.id,
        }),
      });

      if(userBMI?.age !== undefined && userBMI?.weight !== undefined) {
        await fetch("http://127.0.0.1:5000/set-profile", {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            age: userBMI?.age,
            height: userBMI?.height,
            weight: userBMI?.weight,
          }),
        });
      }

      await fetch("http://127.0.0.1:5000/set_exercise/squat", {
        credentials: "include",
      });
  
      setIsLoggedIn(true);
    } catch (err) {
      console.error("Failed to start:", err);
    }
  };

  useEffect(() => {
    if (!user || !isLoggedIn) return;
  
    let interval: NodeJS.Timeout;
  
    const updateStats = async () => {
      try {
        const res = await fetch("http://127.0.0.1:5000/status", {
          credentials: "include",
        });
  
        if (!res.ok) return;
  
        const data = await res.json();
  
        setExercise(data.exercise);
        setReps(data.reps);
        setAngle(data.angle);
        setCalories(data.calories);
      } catch (err) {
        console.error("Stats fetch failed", err);
      }
    };
  
    interval = setInterval(updateStats, 1000);
  
    return () => {
      clearInterval(interval);
  
      fetch("http://127.0.0.1:5000/logout", {
        credentials: "include",
      });
  
      const imgElement = document.querySelector(
        'img[alt="Live Workout Feed"]'
      ) as HTMLImageElement;
  
      if (imgElement) {
        imgElement.src = "";
        imgElement.removeAttribute("src");
      }
    };
  }, [user, isLoggedIn]);

  const changeExercise = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    await fetch(`http://127.0.0.1:5000/set_exercise/${e.target.value}`, {
        credentials: "include"
      });
  };

  const finishWorkout = async () => {
    setExercise("--");
    setReps(0);
    setAngle("--");
    setCalories(0);
    setIsLoggedIn(false);
    const res = await fetch("http://127.0.0.1:5000/finish-workout", {
      credentials: "include"
    });
  };

  return (
    <div className="flex flex-col items-center justify-center gap-6">
        <div className="w-[87vw] h-[87vh] relative flex flex-col items-center justify-between backdrop-blur-sm border border-border p-6 mb-8">
            <CornerElements/>
            <div className="flex items-center justify-center gap-6 w-full">
                <h2 className="text-4xl md:text-5xl font-bold mb-6">
                    <span className="text-foreground">Live </span>
                    <span className="text-primary">AI</span>
                    <span className="text-foreground"> Workout</span>
                </h2>
                <select onChange={changeExercise} className="flex item-center justify-center p-2 border rounded">
                    <option value="squat">Squat</option>
                    <option value="arm_raise">Arm Raise</option>
                    <option value="knee_lift">Knee Lift</option>
                    <option value="lunge">Lunge</option>
                </select>
            </div>

            {/* Video Stream */}
            <div className="w-full max-w-[63vw] h-full rounded-lg overflow-hidden">
                {
                  isLoggedIn ? (
                    <img
                      src="http://127.0.0.1:5000/video"
                      alt="Live Workout Feed"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <img
                      src="/gigachad_live_workout_placeholder.png"
                      alt="Live workout placeholder"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  )
                }
            </div>

            <div className="flex items-center justify-around mt-4 w-full">
                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 text-lg">
                    <div className="flex gap-2 text-xl font-bold">
                        <span className="text-primary">Exercise:</span>
                        <span>{exercise}</span>
                    </div>

                    <div className="flex gap-2 text-xl font-bold">
                        <span className="text-primary">Reps:</span>
                        <span>{reps}</span>
                    </div>

                    <div className="flex gap-2 text-xl font-bold">
                        <span className="text-primary">Angle:</span>
                        <span>{angle}°</span>
                    </div>

                    <div className="flex gap-2 text-xl font-bold">
                        <span className="text-primary">Calories:</span>
                        <span>{calories}</span>
                    </div>
                </div>

                <div className="flex gap-4">
                  <Button
                      onClick={isLoggedIn ? finishWorkout : startWorkout}
                      className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 font-mono dark:text-slate-100"
                  >
                    {isLoggedIn ? 'Finish workout' : 'Start workout'}
                  </Button>
                </div>
            </div>
        </div>
    </div>
  );
}

export default LiveWorkoutPage
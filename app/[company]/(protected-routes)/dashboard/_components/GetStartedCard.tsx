"use client";
import React from "react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import Image from "next/image";
import { CheckCircle } from "lucide-react";
import { useOnboardingStore } from "@/store/onBoardingStore";
import Link from "next/link";


const GetStartedCard = () => {
  const {steps} = useOnboardingStore();
  return (
    <div className="w-full p-6 border bg-secondary rounded-xl border-input">
      <div className="flex flex-col md:flex-row items-center gap-6">
        <div className="w-full md:w-1/4">
          <div className="flex flex-col gap-y-6 items-start">
            <div>
              <h3 className="text-3xl font-semibold text-primary">
                Get Started
              </h3>
              <p className="text-sm text-muted-foreground">
                Lorem ipsum dolor sit amet consectetur. Est tristique in non
              </p>
            </div>
            <div className="flex flex-col gap-y-3 justify-center items-start">
              {steps.map((item) => (
                <Link href={item.link} key={item.id} className="flex gap-x-3 items-center">
                  <CheckCircle
                    className={
                      item.complete
                        ? "stroke-black fill-primary"
                        : "stroke-muted-foreground"
                    }
                  />
                  <p
                    className={`text-sm ${
                      item.complete ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    {item.title}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </div>
        <div className="w-full md:w-3/4 h-[250px] flex-1">
          <AspectRatio ratio={16 / 9}>
            <Image
              src="/moonlight.png"
              alt="Image"
              width={200}
              height={200}
              className="rounded-md object-cover h-[250px] w-full"
            />
          </AspectRatio>
        </div>
      </div>
    </div>
  );
};

export default GetStartedCard;

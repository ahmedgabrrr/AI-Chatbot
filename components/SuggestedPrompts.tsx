"use client";

import React from "react";
import { Code, Mail, Lightbulb, GraduationCap } from "lucide-react";

type Prompt = {
  title: string;
  description: string;
  icon: React.ReactNode;
  text: string;
};

type SuggestedPromptsProps = {
  onSelectPrompt: (text: string) => void;
};

export default function SuggestedPrompts({ onSelectPrompt }: SuggestedPromptsProps) {
  const prompts: Prompt[] = [
    {
      title: "Write & Debug Code",
      description: "Write a TypeScript debounce function with type safety.",
      icon: <Code className="w-5 h-5 text-indigo-500" />,
      text: "Write a TypeScript function to debounce a callback, including full type parameters for the input arguments and return type.",
    },
    {
      title: "Draft Professional Email",
      description: "Draft a polite email asking for project extension.",
      icon: <Mail className="w-5 h-5 text-sky-500" />,
      text: "Draft a polite and professional email to my project manager requesting a 3-day extension on my current milestone, giving a valid reason regarding integration testing.",
    },
    {
      title: "Creative Brainstorming",
      description: "Get 5 unique ideas combining AI with IoT.",
      icon: <Lightbulb className="w-5 h-5 text-amber-500" />,
      text: "Brainstorm 5 creative and unique project ideas that combine Artificial Intelligence with Internet of Things (IoT) devices in smart home setups.",
    },
    {
      title: "Explain Complex Topics",
      description: "Explain quantum computing in simple terms.",
      icon: <GraduationCap className="w-5 h-5 text-emerald-500" />,
      text: "Explain the fundamental concepts of quantum computing, specifically superposition and entanglement, using an analogy suitable for a 12-year-old.",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl w-full mx-auto p-4">
      {prompts.map((prompt, i) => (
        <button
          key={i}
          onClick={() => onSelectPrompt(prompt.text)}
          className="flex items-start gap-4 p-4 rounded-xl border border-border bg-card/50 hover:bg-secondary/40 hover:border-primary/30 transition-all duration-300 text-left shadow-sm group hover:-translate-y-0.5"
        >
          <div className="p-2.5 rounded-lg bg-secondary group-hover:bg-primary/10 transition-colors duration-300">
            {prompt.icon}
          </div>
          <div>
            <h3 className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors duration-200">
              {prompt.title}
            </h3>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
              {prompt.description}
            </p>
          </div>
        </button>
      ))}
    </div>
  );
}

"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const card = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: "easeOut" as const },
  },
};

export function HowToSection() {
  return (
    <section className="px-4 pb-24 pt-8">
      <div className="mx-auto max-w-5xl">
   

        <motion.h2
          className="mt-4 text-center text-sm text-muted-foreground"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.4 }}
        >
          Publish your profile on cutefolio in minutes.
        </motion.h2>

        <motion.div
          className="mt-10 flex flex-col items-center gap-4 text-center"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          transition={{ staggerChildren: 0.1 }}
        >
          <motion.article variants={card} className="max-w-sm">
            <h3 className="mt-3 text-2xl font-semibold text-foreground">Host at cutefolio</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Sign in with Google, edit with the full form, and publish without
              touching JSON.
            </p>
          </motion.article>
        </motion.div>

        <motion.div
          className="mt-10 flex justify-center"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.35 }}
        >
          <Button
            asChild
            variant="outline"
            size="sm"
            className="landing-cta-button group gap-2 px-5"
          >
            <Link href="/compare">
              <span>Compare options</span>
              <span className="relative ml-1 inline-flex h-4 w-4 items-center justify-center overflow-hidden">
                <ArrowUpRight className="size-4 -translate-y-px transition-all duration-200 group-hover:-translate-x-1 group-hover:-translate-y-1 group-hover:opacity-0" />
                <ArrowRight className="size-4 absolute translate-x-1 translate-y-1 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100" />
              </span>
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}

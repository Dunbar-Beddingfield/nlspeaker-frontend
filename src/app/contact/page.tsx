import { Suspense } from "react";
import type { Metadata } from "next";
import { ContactForm } from "./ContactForm";

export const metadata: Metadata = {
  title: "Contact & Booking",
  description:
    "Book a speaker or send a general inquiry to Next Level Speaking Services.",
};

export default function ContactPage() {
  return (
    <Suspense>
      <ContactForm />
    </Suspense>
  );
}

import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { makeReferralCode, readReferralCode, referralLink, REFERRALS_PER_LEVEL, REWARD_PER_LEVEL_GHS } from "@/lib/referrals";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, ConsentCheckbox, SubmitButton, SuccessPanel, inputClass } from "./fields";
import { CLINIC_PARTICIPANTS, FEEDBACK_CATEGORIES, VOLUNTEER_AREAS } from "@/lib/content";
import { isValidPhone } from "@/lib/format";
import { cn } from "@/lib/utils";

// ---------- shared schema pieces ----------
const name = z.string().trim().min(2, "Please enter your full name").max(120, "Name is too long");
const email = z.string().trim().email("Please enter a valid email address").max(255);
const phone = z
  .string()
  .trim()
  .refine(isValidPhone, "Enter a valid phone number, e.g. 024 123 4567 or +233 24 123 4567");
const optionalPhone = z
  .string()
  .trim()
  .optional()
  .refine((v) => !v || isValidPhone(v), "Enter a valid phone number");
const community = z.string().trim().min(2, "Please enter your community or location").max(120);
const consent = z.literal(true, { errorMap: () => ({ message: "Please tick to give your consent" }) });

const selectClass =
  "flex h-11 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

type InsertResult = { ok: true } | { ok: false; message: string };

async function insertRow(table: string, payload: Record<string, unknown>): Promise<InsertResult> {
  // RLS only allows inserts (no reads) for the public; never chain .select() here.
  const { error } = await supabase.from(table as never).insert(payload as never);
  if (!error) return { ok: true };
  if (error.code === "23505") return { ok: false, message: "It looks like you've already submitted this." };
  console.error(error);
  return { ok: false, message: "We couldn't submit your form. Please check your details and try again." };
}

function useSubmit() {
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  async function run(table: string, payload: Record<string, unknown>) {
    if (loading) return; // guard against double submits
    setLoading(true);
    const res = await insertRow(table, payload);
    setLoading(false);
    if (res.ok) setDone(true);
    else toast.error(res.message);
  }
  return { done, setDone, loading, run };
}

const nullIfEmpty = (v?: string | null) => (v && v.trim() ? v.trim() : null);

function useReferralCode() {
  const [ref, setRef] = useState<string | null>(null);
  useEffect(() => setRef(readReferralCode()), []);
  return ref;
}

// ---------- Membership ----------
const memberSchema = z.object({
  full_name: name,
  email,
  phone,
  community,
  occupation: z.string().trim().max(120).optional(),
  interests: z.string().trim().max(1000).optional(),
  motivation: z.string().trim().max(2000).optional(),
  consent,
});

export function MembershipForm() {
  const { done, setDone, loading, run } = useSubmit();
  const ref = useReferralCode();
  const f = useForm<z.infer<typeof memberSchema>>({
    resolver: zodResolver(memberSchema),
    defaultValues: { consent: false as unknown as true },
  });
  const e = f.formState.errors;
  if (done)
    return (
      <SuccessPanel title="Application received" onReset={() => { f.reset(); setDone(false); }}>
        Thank you for applying to become a member. Your application is now <strong>Pending Review</strong> and our team
        will be in touch.
      </SuccessPanel>
    );
  return (
    <form
      noValidate
      className="grid gap-5 sm:grid-cols-2"
      onSubmit={f.handleSubmit((v) =>
        run("members", {
          ...v,
          occupation: nullIfEmpty(v.occupation),
          interests: nullIfEmpty(v.interests),
          motivation: nullIfEmpty(v.motivation),
          referred_by_code: ref,
        }),
      )}
    >
      <Field id="m-name" label="Full name" required error={e.full_name?.message}>
        <Input id="m-name" className={inputClass} autoComplete="name" {...f.register("full_name")} />
      </Field>
      <Field id="m-email" label="Email" required error={e.email?.message}>
        <Input id="m-email" type="email" className={inputClass} autoComplete="email" {...f.register("email")} />
      </Field>
      <Field id="m-phone" label="Phone number" required error={e.phone?.message}>
        <Input id="m-phone" type="tel" className={inputClass} autoComplete="tel" {...f.register("phone")} />
      </Field>
      <Field id="m-community" label="Community / location" required error={e.community?.message}>
        <Input id="m-community" className={inputClass} placeholder="e.g. Zone 4, Ashaiman" {...f.register("community")} />
      </Field>
      <Field id="m-occ" label="Occupation" error={e.occupation?.message} className="sm:col-span-2">
        <Input id="m-occ" className={inputClass} {...f.register("occupation")} />
      </Field>
      <Field id="m-int" label="Areas of interest" error={e.interests?.message} className="sm:col-span-2">
        <Textarea id="m-int" rows={2} {...f.register("interests")} />
      </Field>
      <Field id="m-mot" label="Why do you want to join?" error={e.motivation?.message} className="sm:col-span-2">
        <Textarea id="m-mot" rows={3} {...f.register("motivation")} />
      </Field>
      <div className="sm:col-span-2">
        <Controller
          control={f.control}
          name="consent"
          render={({ field }) => (
            <ConsentCheckbox id="m-consent" checked={!!field.value} onChange={field.onChange} error={e.consent?.message} />
          )}
        />
      </div>
      <div className="sm:col-span-2">
        <SubmitButton loading={loading}>Apply for membership</SubmitButton>
      </div>
    </form>
  );
}

// ---------- Volunteer ----------
const volunteerSchema = z.object({
  full_name: name,
  email,
  phone,
  community,
  areas_of_interest: z.array(z.string()).min(1, "Choose at least one area"),
  experience: z.string().trim().max(2000).optional(),
  availability: z.string().trim().min(2, "Tell us when you're available").max(200),
  consent,
});

export function VolunteerForm() {
  const { done, setDone, loading, run } = useSubmit();
  const ref = useReferralCode();
  const [myCode, setMyCode] = useState(() => "");
  const f = useForm<z.infer<typeof volunteerSchema>>({
    resolver: zodResolver(volunteerSchema),
    defaultValues: { areas_of_interest: [], consent: false as unknown as true },
  });
  const e = f.formState.errors;
  if (done)
    return (
      <SuccessPanel title="Thank you for volunteering!" onReset={() => { f.reset(); setDone(false); }}>
        Your volunteer application has been received. Our Volunteer Coordinator will review it and contact you.
        <ReferralLinkBox code={myCode} />
      </SuccessPanel>
    );
  return (
    <form
      noValidate
      className="grid gap-5 sm:grid-cols-2"
      onSubmit={f.handleSubmit((v) => {
        const code = myCode || makeReferralCode();
        setMyCode(code);
        return run("volunteer_applications", {
          ...v,
          experience: nullIfEmpty(v.experience),
          referral_code: code,
          referred_by_code: ref,
        });
      })}
    >
      <Field id="v-name" label="Full name" required error={e.full_name?.message}>
        <Input id="v-name" className={inputClass} autoComplete="name" {...f.register("full_name")} />
      </Field>
      <Field id="v-email" label="Email" required error={e.email?.message}>
        <Input id="v-email" type="email" className={inputClass} autoComplete="email" {...f.register("email")} />
      </Field>
      <Field id="v-phone" label="Phone number" required error={e.phone?.message}>
        <Input id="v-phone" type="tel" className={inputClass} {...f.register("phone")} />
      </Field>
      <Field id="v-community" label="Community / location" required error={e.community?.message}>
        <Input id="v-community" className={inputClass} {...f.register("community")} />
      </Field>
      <fieldset className="space-y-2 sm:col-span-2">
        <legend className="text-sm font-semibold">
          Areas of interest<span className="ml-0.5 text-destructive">*</span>
        </legend>
        <Controller
          control={f.control}
          name="areas_of_interest"
          render={({ field }) => (
            <div className="flex flex-wrap gap-2">
              {VOLUNTEER_AREAS.map((a) => {
                const on = field.value.includes(a);
                return (
                  <button
                    type="button"
                    key={a}
                    aria-pressed={on}
                    onClick={() => field.onChange(on ? field.value.filter((x) => x !== a) : [...field.value, a])}
                    className={cn(
                      "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                      on ? "border-teal bg-teal text-teal-foreground" : "bg-background hover:border-teal",
                    )}
                  >
                    {a}
                  </button>
                );
              })}
            </div>
          )}
        />
        {e.areas_of_interest && <p className="text-xs font-medium text-destructive">{e.areas_of_interest.message}</p>}
      </fieldset>
      <Field id="v-exp" label="Relevant experience" error={e.experience?.message} className="sm:col-span-2">
        <Textarea id="v-exp" rows={3} {...f.register("experience")} />
      </Field>
      <Field id="v-av" label="Availability" required error={e.availability?.message} className="sm:col-span-2">
        <Input id="v-av" className={inputClass} placeholder="e.g. Weekends, weekday evenings" {...f.register("availability")} />
      </Field>
      <div className="sm:col-span-2">
        <Controller
          control={f.control}
          name="consent"
          render={({ field }) => (
            <ConsentCheckbox id="v-consent" checked={!!field.value} onChange={field.onChange} error={e.consent?.message} />
          )}
        />
      </div>
      <div className="sm:col-span-2">
        <SubmitButton loading={loading}>Submit volunteer application</SubmitButton>
      </div>
    </form>
  );
}

// ---------- Contact / Partnership ----------
const contactSchema = z.object({
  full_name: name,
  email,
  phone: optionalPhone,
  organisation: z.string().trim().max(200).optional(),
  subject: z.string().trim().min(2, "Please add a subject").max(200),
  message: z.string().trim().min(10, "Please write at least 10 characters").max(4000),
  consent,
});

export function ContactForm({ type = "general" }: { type?: "general" | "partnership" }) {
  const { done, setDone, loading, run } = useSubmit();
  const f = useForm<z.infer<typeof contactSchema>>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      consent: false as unknown as true,
      subject: type === "partnership" ? "Partnership enquiry" : "",
    },
  });
  const e = f.formState.errors;
  const p = type === "partnership" ? "p" : "c";
  if (done)
    return (
      <SuccessPanel title="Message sent" onReset={() => { f.reset(); setDone(false); }}>
        Thank you for reaching out. A member of our team will respond as soon as possible.
      </SuccessPanel>
    );
  return (
    <form
      noValidate
      className="grid gap-5 sm:grid-cols-2"
      onSubmit={f.handleSubmit((v) =>
        run("contact_enquiries", {
          ...v,
          enquiry_type: type,
          phone: nullIfEmpty(v.phone),
          organisation: nullIfEmpty(v.organisation),
        }),
      )}
    >
      <Field id={`${p}-name`} label={type === "partnership" ? "Contact person" : "Full name"} required error={e.full_name?.message}>
        <Input id={`${p}-name`} className={inputClass} autoComplete="name" {...f.register("full_name")} />
      </Field>
      <Field id={`${p}-email`} label="Email" required error={e.email?.message}>
        <Input id={`${p}-email`} type="email" className={inputClass} autoComplete="email" {...f.register("email")} />
      </Field>
      <Field id={`${p}-phone`} label="Phone number" error={e.phone?.message}>
        <Input id={`${p}-phone`} type="tel" className={inputClass} {...f.register("phone")} />
      </Field>
      <Field
        id={`${p}-org`}
        label="Organisation"
        required={false}
        error={e.organisation?.message}
      >
        <Input id={`${p}-org`} className={inputClass} {...f.register("organisation")} />
      </Field>
      <Field id={`${p}-subj`} label="Subject" required error={e.subject?.message} className="sm:col-span-2">
        <Input id={`${p}-subj`} className={inputClass} {...f.register("subject")} />
      </Field>
      <Field
        id={`${p}-msg`}
        label={type === "partnership" ? "How would you like to partner with us?" : "Message"}
        required
        error={e.message?.message}
        className="sm:col-span-2"
      >
        <Textarea id={`${p}-msg`} rows={5} {...f.register("message")} />
      </Field>
      <div className="sm:col-span-2">
        <Controller
          control={f.control}
          name="consent"
          render={({ field }) => (
            <ConsentCheckbox id={`${p}-consent`} checked={!!field.value} onChange={field.onChange} error={e.consent?.message} />
          )}
        />
      </div>
      <div className="sm:col-span-2">
        <SubmitButton loading={loading}>{type === "partnership" ? "Send partnership enquiry" : "Send message"}</SubmitButton>
      </div>
    </form>
  );
}

// ---------- Community feedback ----------
const feedbackSchema = z.object({
  community,
  category: z.enum(FEEDBACK_CATEGORIES.map((c) => c.value) as [string, ...string[]], {
    errorMap: () => ({ message: "Please choose a category" }),
  }),
  description: z.string().trim().min(10, "Please describe the concern (at least 10 characters)").max(4000),
  submitter_name: z.string().trim().max(120).optional(),
  submitter_contact: z
    .string()
    .trim()
    .max(255)
    .optional()
    .refine(
      (v) => !v || isValidPhone(v) || z.string().email().safeParse(v).success,
      "Enter a valid phone number or email",
    ),
  consent,
});

export function FeedbackForm() {
  const { done, setDone, loading, run } = useSubmit();
  const f = useForm<z.infer<typeof feedbackSchema>>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: { consent: false as unknown as true, category: "" },
  });
  const e = f.formState.errors;
  if (done)
    return (
      <SuccessPanel title="Thank you — your voice has been heard" onReset={() => { f.reset(); setDone(false); }}>
        Your concern has been recorded privately and will be reviewed by authorised Foundation staff.
      </SuccessPanel>
    );
  return (
    <form
      noValidate
      className="grid gap-5 sm:grid-cols-2"
      onSubmit={f.handleSubmit((v) =>
        run("community_feedback", {
          ...v,
          submitter_name: nullIfEmpty(v.submitter_name),
          submitter_contact: nullIfEmpty(v.submitter_contact),
        }),
      )}
    >
      <Field id="f-comm" label="Community or location" required error={e.community?.message}>
        <Input id="f-comm" className={inputClass} placeholder="e.g. Taifa, Ashaiman" {...f.register("community")} />
      </Field>
      <Field id="f-cat" label="Category of concern" required error={e.category?.message}>
        <select id="f-cat" className={selectClass} {...f.register("category")}>
          <option value="">Select a category…</option>
          {FEEDBACK_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </Field>
      <Field id="f-desc" label="Description of the concern" required error={e.description?.message} className="sm:col-span-2">
        <Textarea id="f-desc" rows={6} {...f.register("description")} />
      </Field>
      <Field id="f-name" label="Your name" error={e.submitter_name?.message}>
        <Input id="f-name" className={inputClass} {...f.register("submitter_name")} />
      </Field>
      <Field id="f-contact" label="Phone number or email" error={e.submitter_contact?.message} hint="Only if you'd like us to follow up.">
        <Input id="f-contact" className={inputClass} {...f.register("submitter_contact")} />
      </Field>
      <div className="sm:col-span-2">
        <Controller
          control={f.control}
          name="consent"
          render={({ field }) => (
            <ConsentCheckbox id="f-consent" checked={!!field.value} onChange={field.onChange} error={e.consent?.message} />
          )}
        />
      </div>
      <div className="sm:col-span-2">
        <SubmitButton loading={loading}>Submit feedback</SubmitButton>
      </div>
    </form>
  );
}

export function EmergencyNotice() {
  return (
    <div role="note" className="flex gap-3 rounded-xl border border-warning/50 bg-warning/15 p-4 text-sm text-warning-foreground">
      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
      <p>
        <strong>This is not an emergency service.</strong> For emergencies, call Ghana's emergency numbers: Police{" "}
        <strong>191</strong>, Fire <strong>192</strong>, Ambulance <strong>193</strong>, or the national line{" "}
        <strong>112</strong>.
      </p>
    </div>
  );
}

// ---------- Programme interest ----------
const interestSchema = z.object({
  full_name: name,
  email,
  phone,
  participant_category: z.string().min(1, "Please choose the option that best describes you"),
  institution: z.string().trim().max(200).optional(),
  community: z.string().trim().max(120).optional(),
  motivation: z.string().trim().max(2000).optional(),
  consent,
});

export function ProgrammeInterestForm({ programmeId, registrationStatus }: { programmeId: string | null; registrationStatus: string }) {
  const { done, setDone, loading, run } = useSubmit();
  const f = useForm<z.infer<typeof interestSchema>>({
    resolver: zodResolver(interestSchema),
    defaultValues: { consent: false as unknown as true, participant_category: "" },
  });
  const e = f.formState.errors;
  const verb = registrationStatus === "open" ? "Apply now" : "Register my interest";
  if (done)
    return (
      <SuccessPanel title="You're on the list" onReset={() => { f.reset(); setDone(false); }}>
        {registrationStatus === "open"
          ? "Your application has been received. Our programme team will review it and contact you."
          : "Thank you for registering your interest. We'll contact you when registration opens."}
      </SuccessPanel>
    );
  return (
    <form
      noValidate
      className="grid gap-5 sm:grid-cols-2"
      onSubmit={f.handleSubmit((v) =>
        run("programme_applications", {
          ...v,
          programme_id: programmeId,
          institution: nullIfEmpty(v.institution),
          community: nullIfEmpty(v.community),
          motivation: nullIfEmpty(v.motivation),
        }),
      )}
    >
      <Field id="pi-name" label="Full name" required error={e.full_name?.message}>
        <Input id="pi-name" className={inputClass} {...f.register("full_name")} />
      </Field>
      <Field id="pi-email" label="Email" required error={e.email?.message}>
        <Input id="pi-email" type="email" className={inputClass} {...f.register("email")} />
      </Field>
      <Field id="pi-phone" label="Phone number" required error={e.phone?.message}>
        <Input id="pi-phone" type="tel" className={inputClass} {...f.register("phone")} />
      </Field>
      <Field id="pi-cat" label="I am a…" required error={e.participant_category?.message}>
        <select id="pi-cat" className={selectClass} {...f.register("participant_category")}>
          <option value="">Select…</option>
          {CLINIC_PARTICIPANTS.map((c) => (
            <option key={c}>{c}</option>
          ))}
          <option>Other</option>
        </select>
      </Field>
      <Field id="pi-inst" label="School / institution / group" error={e.institution?.message}>
        <Input id="pi-inst" className={inputClass} {...f.register("institution")} />
      </Field>
      <Field id="pi-comm" label="Community" error={e.community?.message}>
        <Input id="pi-comm" className={inputClass} {...f.register("community")} />
      </Field>
      <Field id="pi-mot" label="What do you hope to gain?" error={e.motivation?.message} className="sm:col-span-2">
        <Textarea id="pi-mot" rows={3} {...f.register("motivation")} />
      </Field>
      <div className="sm:col-span-2">
        <Controller
          control={f.control}
          name="consent"
          render={({ field }) => (
            <ConsentCheckbox id="pi-consent" checked={!!field.value} onChange={field.onChange} error={e.consent?.message} />
          )}
        />
      </div>
      <div className="sm:col-span-2">
        <SubmitButton loading={loading}>{verb}</SubmitButton>
      </div>
    </form>
  );
}

// ---------- Event registration ----------
const eventRegSchema = z.object({ full_name: name, email, phone: optionalPhone, consent });

export function EventRegistrationForm({ eventId }: { eventId: string }) {
  const { done, loading, run } = useSubmit();
  const f = useForm<z.infer<typeof eventRegSchema>>({
    resolver: zodResolver(eventRegSchema),
    defaultValues: { consent: false as unknown as true },
  });
  const e = f.formState.errors;
  if (done) return <SuccessPanel title="You're registered">We look forward to seeing you.</SuccessPanel>;
  return (
    <form
      noValidate
      className="grid gap-4 sm:grid-cols-3"
      onSubmit={f.handleSubmit((v) => run("event_registrations", { ...v, event_id: eventId, phone: nullIfEmpty(v.phone) }))}
    >
      <Field id={`er-name-${eventId}`} label="Full name" required error={e.full_name?.message}>
        <Input id={`er-name-${eventId}`} className={inputClass} {...f.register("full_name")} />
      </Field>
      <Field id={`er-email-${eventId}`} label="Email" required error={e.email?.message}>
        <Input id={`er-email-${eventId}`} type="email" className={inputClass} {...f.register("email")} />
      </Field>
      <Field id={`er-phone-${eventId}`} label="Phone" error={e.phone?.message}>
        <Input id={`er-phone-${eventId}`} type="tel" className={inputClass} {...f.register("phone")} />
      </Field>
      <div className="sm:col-span-3">
        <Controller
          control={f.control}
          name="consent"
          render={({ field }) => (
            <ConsentCheckbox id={`er-consent-${eventId}`} checked={!!field.value} onChange={field.onChange} error={e.consent?.message} />
          )}
        />
      </div>
      <div className="sm:col-span-3">
        <SubmitButton loading={loading}>Register for this event</SubmitButton>
      </div>
    </form>
  );
}

function ReferralLinkBox({ code }: { code: string }) {
  const [origin, setOrigin] = useState("");
  useEffect(() => setOrigin(window.location.origin), []);
  if (!code) return null;
  const link = referralLink(origin, code);
  return (
    <div className="mt-4 space-y-2 rounded-lg border bg-background p-4 text-left text-sm">
      <p className="font-semibold text-primary">Your personal invite link</p>
      <p className="text-muted-foreground">
        Share it. Every {REFERRALS_PER_LEVEL} people who sign up as members or volunteers through it move you up a
        badge level and earn you GHS {REWARD_PER_LEVEL_GHS.toFixed(2)}.
      </p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input readOnly value={link} className="font-mono text-xs" onFocus={(e) => e.currentTarget.select()} />
        <button
          type="button"
          className="rounded-md bg-teal px-4 py-2 text-sm font-semibold text-teal-foreground"
          onClick={() => navigator.clipboard.writeText(link).then(() => toast.success("Link copied"))}
        >
          Copy link
        </button>
      </div>
      <p className="text-muted-foreground">
        Your code is <strong className="font-mono text-foreground">{code}</strong>. Keep it safe and use it to{" "}
        <Link to="/referrals" className="font-semibold text-teal underline">check your progress</Link>.
      </p>
    </div>
  );
}

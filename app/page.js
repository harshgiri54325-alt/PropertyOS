"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "../lib/supabase/client";
import { useRouter } from "next/navigation";

const emptyProperty = {
  title: "",
  property_type: "Apartment",
  transaction_type: "sale",
  price: "",
  area: "",
  bedrooms: "",
  location: "",
  status: "available",
  description: "",
};

const emptyLead = {
  name: "",
  phone: "",
  requirement: "",
  budget: "",
  location: "",
  status: "new",
  next_follow_up: "",
  notes: "",
};

export default function Home() {
  const supabase = createClient();
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [properties, setProperties] = useState([]);
  const [leads, setLeads] = useState([]);
  const [tab, setTab] = useState("dashboard");
  const [property, setProperty] = useState(emptyProperty);
  const [lead, setLead] = useState(emptyLead);
  const [showProperty, setShowProperty] = useState(false);
  const [showLead, setShowLead] = useState(false);
  const [loading, setLoading] = useState(true);

  async function load() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.replace("/auth");
      return;
    }

    setUser(user);

    const [p, l] = await Promise.all([
      supabase
        .from("properties")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false }),
    ]);

    setProperties(p.data || []);
    setLeads(l.data || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function addProperty(e) {
    e.preventDefault();

    const { error } = await supabase.from("properties").insert({
      ...property,
      user_id: user.id,
      price: property.price ? Number(property.price) : null,
      area: property.area ? Number(property.area) : null,
      bedrooms: property.bedrooms ? Number(property.bedrooms) : null,
    });

    if (!error) {
      setShowProperty(false);
      setProperty(emptyProperty);
      load();
    }
  }

  async function addLead(e) {
    e.preventDefault();

    const { error } = await supabase.from("leads").insert({
      ...lead,
      user_id: user.id,
      budget: lead.budget ? Number(lead.budget) : null,
      next_follow_up: lead.next_follow_up || null,
    });

    if (!error) {
      setShowLead(false);
      setLead(emptyLead);
      load();
    }
  }

  async function removeProperty(id) {
    await supabase.from("properties").delete().eq("id", id);
    load();
  }

  async function removeLead(id) {
    await supabase.from("leads").delete().eq("id", id);

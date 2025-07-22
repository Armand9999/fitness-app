import { createClient } from "@/utils/supabase/server";
import { NextApiRequest, NextApiResponse } from "next";
import { calculateTDE } from "../lib/tde";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") { return res.status(405).end(); }

    const { id, age, weight, height, gender, activity_level } = req.body;

    // Input validation
    if (!age || !weight || !height || !gender || !activity_level) {
        return res.status(400).json({ error: "Missing required parameters" });
    }

    if (typeof age !== 'number' || typeof weight !== 'number' || typeof height !== 'number' ||
        typeof gender !== 'string' || typeof activity_level !== 'number') {
        return res.status(400).json({ error: "Invalid parameter types" });
    }

    const tde = calculateTDE(age, weight, height, String(gender), String(activity_level));


    const supabase = createClient();

    const { error } = await (await supabase)
        .from('tde_estimates')
        .insert([{ id, tde_value: tde, method: 'Mifflin-St Jeor' }])
    
    if(error) {
        // Use a generic error message instead of returning the raw error object
        return res.status(500).json({ error: "An internal server error occurred" });
    }
  
    res.status(200).json({ tde })

}

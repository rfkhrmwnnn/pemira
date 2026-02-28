import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/database"; // Assuming there's a type file, we can just use any if it's missing but let's be careful

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { users } = await request.json();

    if (!Array.isArray(users) || users.length === 0) {
      return NextResponse.json({ error: "Data tidak valid atau kosong" }, { status: 400 });
    }

    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[]
    };

    for (const user of users) {
      // Expecting { nim: string, full_name: string, jurusan_id?: string, ukm_id?: string }
      if (!user.nim || !user.full_name) {
        results.failed++;
        results.errors.push(`Data tidak lengkap untuk NIM: ${user.nim || 'Unknown'}`);
        continue;
      }

      const email = `${user.nim}@student.ikmi.ac.id`;
      const password = user.nim; // Default password applies as nim for convenience based on user intent

      // 1. Create auth user bypassing email verification
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: user.full_name,
          nim: user.nim
        }
      });

      if (authError) {
        // If user already exists, maybe we just want to skip or update, for now we record error
        results.failed++;
        results.errors.push(`Gagal membuat akun ${user.nim}: ${authError.message}`);
        continue;
      }

      if (authData.user) {
        // 2. Insert into profiles
        const { error: profileError } = await supabaseAdmin.from('profiles').insert([
          {
            id: authData.user.id,
            nim: user.nim.toString(),
            full_name: user.full_name,
            jurusan_id: user.jurusan_id || null,
            role: 'student'
          }
        ]);

        if (profileError) {
          results.failed++;
          results.errors.push(`Gagal menyimpan profil untuk ${user.nim}: ${profileError.message}`);
          continue;
        }

        // 3. Insert into ukm_members if ukm_id is provided in the Excel (optional logic)
        if (user.ukm_id) {
            await supabaseAdmin.from('ukm_members').insert([
                {
                    ukm_id: user.ukm_id,
                    profile_id: authData.user.id
                }
            ]);
        }
        
        results.success++;
      }
    }

    return NextResponse.json({ 
      message: "Proses import selesai",
      results 
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";
import { z } from "zod";

const registerSchema = z.object({
  username: z.string().min(3).max(20),
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, email, password } = registerSchema.parse(body);

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { email }],
      },
    });

    if (existingUser) {
      return Response.json(
        { error: "Username or email already exists" },
        { status: 400 }
      );
    }

    // Hash the password
    const hashedPassword = await hash(password, 12);

    // Create the user
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
    });

    return Response.json(
      {
        message: "User created successfully",
        user: {
          uuid: user.uuid,
          username: user.username,
          email: user.email,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        { error: "Invalid input" },
        { status: 400 }
      );
    }

    return Response.json(
      { error: "An error occurred during registration" },
      { status: 500 }
    );
  }
}

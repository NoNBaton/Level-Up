import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

function hasCode(error: unknown, code: string) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === code
  );
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const nickname = String(body.nickname ?? "").trim().toUpperCase();
    const password = String(body.password ?? "");

    if (nickname.length < 3 || nickname.length > 24) {
      return NextResponse.json(
        { error: "НИКНЕЙМ ДОЛЖЕН БЫТЬ ОТ 3 ДО 24 СИМВОЛОВ" },
        { status: 400 }
      );
    }
    if (password.length < 6) {
      return NextResponse.json(
        { error: "КОД ДОСТУПА — МИНИМУМ 6 СИМВОЛОВ" },
        { status: 400 }
      );
    }

    const existing = await prisma.player.findUnique({ where: { nickname } });
    if (existing) {
      return NextResponse.json(
        { error: "ЭТОТ НИКНЕЙМ УЖЕ ЗАНЯТ ДРУГИМ ОХОТНИКОМ" },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const player = await prisma.player.create({
      data: { nickname, passwordHash },
    });

    return NextResponse.json({
      status: "ok",
      account: {
        name: player.nickname,
        authId: "ID-" + player.id.slice(0, 8).toUpperCase(),
      },
    });
  } catch (error) {
    if (hasCode(error, "P2002")) {
      return NextResponse.json(
        { error: "ЭТОТ НИКНЕЙМ УЖЕ ЗАНЯТ ДРУГИМ ОХОТНИКОМ" },
        { status: 409 }
      );
    }
    console.error(error);
    return NextResponse.json(
      { error: "ОШИБКА СИСТЕМЫ СОХРАНЕНИЯ" },
      { status: 500 }
    );
  }
}
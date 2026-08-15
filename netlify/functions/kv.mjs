// Netlify Function: 완전 무료(Netlify Blobs)로 study-log 데이터를 저장/조회하는 API
// 배포되면 자동으로 /.netlify/functions/kv 경로로 열려요. 별도 설치/설정 필요 없음.
//
// 사용법 (프론트엔드 fetch):
//   GET  /.netlify/functions/kv?key=study-log-state-v1:doby1
//   POST /.ne// Netlify Function: 완전 무료(Netlify Blobs)로 study-log 데이터를 저장/조회하는 API
// 배포되면 자동으로 /.netlify/functions/kv 경로로 열려요. 별도 설치/설정 필요 없음.
//
// 사용법 (프론트엔드 fetch):
//   GET  /.netlify/functions/kv?key=study-log-state-v1:doby1
//   POST /.netlify/functions/kv   body: { key: "...", value: "..." }
//
// 관리자용 사용자 목록:
//   GET  /.netlify/functions/kv?list=users
//     -> 지금까지 저장이 한 번이라도 된 사용자 key 목록 + 마지막 저장 시각을 돌려줌

import { getStore } from "@netlify/blobs";

const STORE_NAME = "study-log";
const INDEX_KEY = "__user_index__"; // { [userId]: { lastSavedAt: ISOString } }

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

async function readIndex(store) {
  const raw = await store.get(INDEX_KEY, { type: "json" });
  return raw || {};
}

async function touchIndex(store, userId) {
  // state 키(study-log-state-v1:XXX)에서만 사용자 인덱스를 갱신함
  if (!userId || userId.startsWith("study-log-")) return;
  const idx = await readIndex(store);
  idx[userId] = { lastSavedAt: new Date().toISOString() };
  await store.setJSON(INDEX_KEY, idx);
}

export default async (req) => {
  try{
    if (req.method === "OPTIONS") return json({}, 200);

    const store = getStore(STORE_NAME);
    const url = new URL(req.url);

    if (req.method === "GET") {
      // 관리자용: 저장된 사용자 목록 확인
      if (url.searchParams.get("list") === "users") {
        const idx = await readIndex(store);
        return json({ users: idx });
      }

      const key = url.searchParams.get("key");
      if (!key) return json({ error: "key가 필요해요" }, 400);
      const value = await store.get(key);
      return json({ key, value: value ?? null });
    }

    if (req.method === "POST") {
      const body = await req.json().catch(() => null);
      if (!body || !body.key) return json({ error: "key가 필요해요" }, 400);
      await store.set(body.key, body.value ?? "");
      // study-log-state-v1:userId 형태의 키일 때만 사용자별 마지막 저장 시각 기록
      if (body.key.startsWith("study-log-state-v1:")) {
        const userId = body.key.slice("study-log-state-v1:".length);
        await touchIndex(store, userId);
      }
      return json({ ok: true });
    }

    return json({ error: "지원하지 않는 요청이에요" }, 405);
  }catch(err){
    // 여기서 실제로 무슨 에러가 났는지 그대로 돌려줘서 원인을 바로 알 수 있게 함
    return json({ error: "서버 함수 내부 오류", message: String(err && err.message || err), stack: String(err && err.stack || '') }, 500);
  }
};
tlify/functions/kv   body: { key: "...", value: "..." }
//
// 관리자용 사용자 목록:
//   GET  /.netlify/functions/kv?list=users
//     -> 지금까지 저장이 한 번이라도 된 사용자 key 목록 + 마지막 저장 시각을 돌려줌

import { getStore } from "@netlify/blobs";

const STORE_NAME = "study-log";
const INDEX_KEY = "__user_index__"; // { [userId]: { lastSavedAt: ISOString } }

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

async function readIndex(store) {
  const raw = await store.get(INDEX_KEY, { type: "json" });
  return raw || {};
}

async function touchIndex(store, userId) {
  // state 키(study-log-state-v1:XXX)에서만 사용자 인덱스를 갱신함
  if (!userId || userId.startsWith("study-log-")) return;
  const idx = await readIndex(store);
  idx[userId] = { lastSavedAt: new Date().toISOString() };
  await store.setJSON(INDEX_KEY, idx);
}

export default async (req) => {
  if (req.method === "OPTIONS") return json({}, 200);

  const store = getStore(STORE_NAME);
  const url = new URL(req.url);

  if (req.method === "GET") {
    // 관리자용: 저장된 사용자 목록 확인
    if (url.searchParams.get("list") === "users") {
      const idx = await readIndex(store);
      return json({ users: idx });
    }

    const key = url.searchParams.get("key");
    if (!key) return json({ error: "key가 필요해요" }, 400);
    const value = await store.get(key);
    return json({ key, value: value ?? null });
  }

  if (req.method === "POST") {
    const body = await req.json().catch(() => null);
    if (!body || !body.key) return json({ error: "key가 필요해요" }, 400);
    await store.set(body.key, body.value ?? "");
    // study-log-state-v1:userId 형태의 키일 때만 사용자별 마지막 저장 시각 기록
    if (body.key.startsWith("study-log-state-v1:")) {
      const userId = body.key.slice("study-log-state-v1:".length);
      await touchIndex(store, userId);
    }
    return json({ ok: true });
  }

  return json({ error: "지원하지 않는 요청이에요" }, 405);
};

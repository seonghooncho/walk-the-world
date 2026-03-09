#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const rootDir = process.cwd();
const outputPath =
  process.argv[2] ||
  path.join(
    rootDir,
    "backend/src/main/resources/db/migration/V2__seed_reference_data.sql",
  );

function extractLiteral(source, pattern, label) {
  const match = source.match(pattern);
  if (!match) {
    throw new Error(`${label} literal not found`);
  }
  return match[1];
}

function parseCities() {
  const source = fs.readFileSync(path.join(rootDir, "fe/src/mocks/mockData.ts"), "utf8");
  const citiesLiteral = extractLiteral(
    source,
    /export const cities: City\[\] = (\[[\s\S]*?\n\]);\n\nexport const currentUser/,
    "cities",
  );
  return vm.runInNewContext(citiesLiteral);
}

function parseCityMissions() {
  const source = fs.readFileSync(path.join(rootDir, "fe/src/mocks/missionData.ts"), "utf8");
  const missionsLiteral = extractLiteral(
    source,
    /export const cityMissions: Record<string, Mission\[]> = (\{[\s\S]*?\n\});\n\nexport function getMissionProgress/,
    "cityMissions",
  ).replace(/image:\s*([A-Za-z_][A-Za-z0-9_]*)/g, 'image: "$1"');

  return vm.runInNewContext(`(${missionsLiteral})`);
}

function sqlString(value) {
  if (value === null || value === undefined) {
    return "NULL";
  }

  return `'${String(value).replaceAll("'", "''")}'`;
}

function sqlBoolean(value) {
  return value ? "TRUE" : "FALSE";
}

function sqlNumber(value) {
  if (value === null || value === undefined) {
    return "NULL";
  }

  return String(value);
}

function buildInsert(table, columns, rows) {
  if (rows.length === 0) {
    return "";
  }

  const values = rows.map((row) => `  (${row.join(", ")})`).join(",\n");
  return `INSERT INTO ${table} (${columns.join(", ")})\nVALUES\n${values};\n`;
}

const cities = parseCities();
const cityMissions = parseCityMissions();

const cityRows = cities.map((city, index) => [
  sqlString(city.id),
  sqlString(city.name),
  sqlString(city.country),
  sqlString(city.countryFlag),
  sqlNumber(city.stepsRequired),
  sqlNumber(city.lat),
  sqlNumber(city.lng),
  sqlString(city.description),
  sqlNumber(index + 1),
]);

const cityFoodRows = cities.flatMap((city) =>
  city.famousFood.map((food) => [sqlString(city.id), sqlString(food)]),
);

const cityLandmarkRows = cities.flatMap((city) =>
  city.landmarks.map((landmark) => [sqlString(city.id), sqlString(landmark)]),
);

const missionRows = Object.values(cityMissions).flatMap((missions) =>
  missions.map((mission, index) => [
    sqlString(mission.id),
    sqlString(mission.cityId),
    sqlString(mission.type),
    sqlString(mission.title),
    sqlString(mission.description),
    "NULL",
    sqlNumber(mission.stepsRequired),
    sqlString(mission.emoji),
    sqlString(mission.reward),
    sqlBoolean(Boolean(mission.aiComposite)),
    sqlString(mission.aiPrompt),
    sqlNumber(index + 1),
  ]),
);

const sql = [
  "-- Generated from fe/src/mocks/mockData.ts and fe/src/mocks/missionData.ts",
  "-- Do not edit manually. Re-run `node bin/generate-reference-seed.mjs` after world data changes.",
  "",
  buildInsert(
    "cities",
    [
      "id",
      "name",
      "country",
      "country_flag",
      "steps_required",
      "lat",
      "lng",
      "description",
      "sort_order",
    ],
    cityRows,
  ),
  buildInsert("city_foods", ["city_id", "name"], cityFoodRows),
  buildInsert("city_landmarks", ["city_id", "name"], cityLandmarkRows),
  buildInsert(
    "missions",
    [
      "id",
      "city_id",
      "type",
      "title",
      "description",
      "image_url",
      "steps_required",
      "emoji",
      "reward",
      "ai_composite",
      "ai_prompt",
      "sort_order",
    ],
    missionRows,
  ),
].join("\n");

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${sql.trim()}\n`);

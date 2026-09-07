import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";

const csvPath = path.join(
  process.cwd(),
  "data",
  "hospital_directory.csv"
);

const csvData = fs.readFileSync(csvPath, "utf-8");

const governmentHospitals = parse(csvData, {
  columns: true,
  skip_empty_lines: true,
});

console.log(
  `Government hospital data loaded: ${governmentHospitals.length} hospitals`
);

const normalizeText = (text = "") => {
  return text
    .toLowerCase()
    .replace(
      /\b(hospital|hospitals|clinic|clinics|medical|centre|center|institute|institutes|pvt|private|ltd|limited)\b/g,
      " "
    )
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

const getTokens = (text = "") => {
  return normalizeText(text)
    .split(/\s+/)
    .filter((token) => token.length >= 2);
};

const getDistanceKm = (lat1, lng1, lat2, lng2) => {
  const R = 6371;

  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

/*
  --------------------------------------------------
  CREATE GOVERNMENT HOSPITAL INDEX
  --------------------------------------------------

  Instead of checking all 30,273 hospitals for every
  OSM hospital, store government hospitals by name token.

  Example:

  "fortis"
      -> Fortis Hospital record

  "yashoda"
      -> Yashoda Hospital records

  This makes matching much faster.
*/

const governmentHospitalIndex = new Map();

governmentHospitals.forEach((hospital) => {
  const nameTokens = getTokens(hospital.Hospital_Name || "");

  nameTokens.forEach((token) => {
    if (!governmentHospitalIndex.has(token)) {
      governmentHospitalIndex.set(token, []);
    }

    governmentHospitalIndex.get(token).push(hospital);
  });
});

console.log(
  `Government hospital index created: ${governmentHospitalIndex.size} name tokens`
);

export const getGovernmentHospitals = () => {
  return governmentHospitals;
};

export const findGovernmentHospital = (
  osmHospitalName,
  latitude,
  longitude,
  osmAddress = ""
) => {
  const osmNameTokens = getTokens(osmHospitalName);
  const osmAddressTokens = getTokens(osmAddress);

  if (osmNameTokens.length === 0) {
    return null;
  }

  /*
    Get only government hospitals that share
    at least one meaningful name token.

    This avoids scanning all 30,273 records.
  */
  const candidateSet = new Set();

  osmNameTokens.forEach((token) => {
    const candidates = governmentHospitalIndex.get(token) || [];

    candidates.forEach((hospital) => {
      candidateSet.add(hospital);
    });
  });

  let bestMatch = null;
  let bestScore = -1;

  for (const hospital of candidateSet) {
    const governmentName = hospital.Hospital_Name || "";

    const governmentAddress = [
      hospital.Address_Original_First_Line || "",
      hospital.Location || "",
      hospital.District || "",
      hospital.Pincode || "",
    ].join(" ");

    const governmentNameTokens = getTokens(governmentName);
    const governmentAddressTokens = getTokens(governmentAddress);

    if (governmentNameTokens.length === 0) {
      continue;
    }

    // -----------------------------
    // NAME MATCH
    // -----------------------------

    const commonNameTokens = [
      ...new Set(
        osmNameTokens.filter((token) =>
          governmentNameTokens.includes(token)
        )
      ),
    ];

    const osmUniqueTokens = [...new Set(osmNameTokens)];

    const nameOverlap =
      commonNameTokens.length / osmUniqueTokens.length;

    if (commonNameTokens.length === 0) {
      continue;
    }

    /*
      Prevent weak matches.

      Example:

      Shanti Gopal
      vs
      Shanti

      Only 1 of 2 meaningful words matches,
      therefore reject.
    */
    if (
      osmUniqueTokens.length >= 2 &&
      commonNameTokens.length < 2 &&
      nameOverlap < 0.8
    ) {
      continue;
    }

    let score = 0;

    if (nameOverlap === 1) {
      score += 100;
    } else if (nameOverlap >= 0.8) {
      score += 80;
    } else if (nameOverlap >= 0.5) {
      score += 50;
    }

    // -----------------------------
    // ADDRESS MATCH
    // -----------------------------

    const commonAddressTokens = [
      ...new Set(
        osmAddressTokens.filter((token) =>
          governmentAddressTokens.includes(token)
        )
      ),
    ];

    if (commonAddressTokens.length > 0) {
      score += commonAddressTokens.length * 15;
    }

    // -----------------------------
    // COORDINATE MATCH
    // -----------------------------

    let hasValidGovernmentCoordinates = false;
    let distance = null;

    if (hospital.Location_Coordinates) {
      const coordinates = hospital.Location_Coordinates
        .split(",")
        .map((value) => Number(value.trim()));

      if (
        coordinates.length === 2 &&
        !Number.isNaN(coordinates[0]) &&
        !Number.isNaN(coordinates[1])
      ) {
        hasValidGovernmentCoordinates = true;

        const govLat = coordinates[0];
        const govLng = coordinates[1];

        distance = getDistanceKm(
          latitude,
          longitude,
          govLat,
          govLng
        );

        if (distance > 5) {
          continue;
        }

        score += Math.max(0, 50 - distance * 10);
      }
    }

    // -----------------------------
    // MISSING GOVERNMENT COORDINATES
    // -----------------------------

    /*
      Some government records don't have coordinates.

      In that case, address confirmation is required.
    */
    if (!hasValidGovernmentCoordinates) {
      if (commonAddressTokens.length < 2) {
        continue;
      }

      score += 25;
    }

    // -----------------------------
    // SINGLE WORD NAME SAFETY
    // -----------------------------

    if (osmUniqueTokens.length === 1) {
      const hasAddressMatch = commonAddressTokens.length >= 2;

      const hasNearbyCoordinates =
        hasValidGovernmentCoordinates &&
        distance !== null &&
        distance <= 5;

      if (!hasAddressMatch && !hasNearbyCoordinates) {
        continue;
      }
    }

    // -----------------------------
    // BEST MATCH
    // -----------------------------

    if (score > bestScore) {
      bestScore = score;
      bestMatch = hospital;
    }
  }

  /*
    Do NOT print every nearby hospital match.
    This was making the terminal look like the
    search was returning all hospitals.
  */

  return bestMatch;
};

console.log(
  "GOVERNMENT DATA TEST:",
  governmentHospitals.length
);
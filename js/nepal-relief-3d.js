import * as THREE from './vendor/three.module.min.js';

/**
 * Nepal 3D Museum Topographical Relief
 * Built from real NASA SRTM / Terrarium Digital Elevation Data (60 m – 8,848.86 m),
 * official 78,552-vertex Survey Department boundary (including Limpiyadhura / Kalapani / Lipulekh),
 * 5 LRMP physiographic belts, 7 federal provinces, D8 hydrological rivers, and 16-azimuth Sky-View AO.
 */

const LON0 = 79.96;
const LON1 = 88.30;
const LAT0 = 26.28;
const LAT1 = 30.54;

const WORLD_W = 10.0;
const HALF_W = WORLD_W * 0.5;
const METER_TO_WORLD = 1.0 / 81680.0; // 1 world unit ≈ 81.68 km true ground scale
const PLINTH_HEIGHT = 0.044;
const MIN_ZOOM_RADIUS = 0.88; // Deep valley & summit-amphitheater closeup without clipping border wall
const MAX_ZOOM_RADIUS = 15.5;

const ZONE_META = {
    1: { name: 'Terai Plains', eco: 'Terai', ecoId: 1, share: '17%', color: '#2f9e66' },
    2: { name: 'Chure / Siwalik', eco: 'Hills (Pahad)', ecoId: 2, share: '68%', color: '#c98a35' },
    3: { name: 'Middle Hills (Pahad)', eco: 'Hills (Pahad)', ecoId: 2, share: '68%', color: '#d4843b' },
    4: { name: 'High Mountains', eco: 'Himal', ecoId: 3, share: '15%', color: '#4b86e8' },
    5: { name: 'High Himalaya', eco: 'Himal', ecoId: 3, share: '15%', color: '#7db4ff' }
};

const PROV_META = {
    1: { name: 'Koshi', nep: 'कोशी', color: '#4c8eda' },
    2: { name: 'Madhesh', nep: 'मधेश', color: '#3ea377' },
    3: { name: 'Bagmati', nep: 'बागमती', color: '#d97b43' },
    4: { name: 'Gandaki', nep: 'गण्डकी', color: '#8f6fd6' },
    5: { name: 'Lumbini', nep: 'लुम्बिनी', color: '#c9a13b' },
    6: { name: 'Karnali', nep: 'कर्णाली', color: '#4ca6a8' },
    7: { name: 'Sudurpashchim', nep: 'सुदूरपश्चिम', color: '#cf6679' }
};

const LANDMARKS = [
    {
        id: 'everest',
        name: 'Sagarmatha (Mt. Everest)',
        short: 'Sagarmatha · Everest',
        nep: 'सगरमाथा',
        lat: 27.9881,
        lon: 86.9250,
        elev: 8849,
        kind: 'peak',
        tier: 1,
        desc: 'Highest point on Earth (8,848.86 m), crowning the Mahalangur Himal along the Solukhumbu–Tibet crest.'
    },
    {
        id: 'kangchenjunga',
        name: 'Kangchenjunga',
        short: 'Kangchenjunga',
        nep: 'कञ्चनजङ्घा',
        lat: 27.7025,
        lon: 88.1461,
        elev: 8586,
        kind: 'peak',
        tier: 1,
        desc: 'World’s 3rd highest mountain (8,586 m), anchoring Nepal’s far-eastern border in Taplejung.'
    },
    {
        id: 'lhotse',
        name: 'Lhotse',
        short: 'Lhotse',
        nep: 'ल्होत्से',
        lat: 27.9617,
        lon: 86.9310,
        elev: 8516,
        kind: 'peak',
        tier: 2,
        desc: 'World’s 4th highest peak (8,516 m), linked directly to Sagarmatha across the South Col.'
    },
    {
        id: 'makalu',
        name: 'Makalu',
        short: 'Makalu',
        nep: 'मकालु',
        lat: 27.8897,
        lon: 87.0875,
        elev: 8485,
        kind: 'peak',
        tier: 2,
        desc: 'World’s 5th highest peak (8,485 m) — an isolated four-ridged rock pyramid west of the deep Arun Gorge.'
    },
    {
        id: 'cho-oyu',
        name: 'Cho Oyu',
        short: 'Cho Oyu',
        nep: 'चो ओयु',
        lat: 28.0942,
        lon: 86.6608,
        elev: 8188,
        kind: 'peak',
        tier: 2,
        desc: 'World’s 6th highest peak (8,188 m), standing beside the historic Nangpa La Sherpa–Tibetan trade pass.'
    },
    {
        id: 'dhaulagiri',
        name: 'Dhaulagiri I',
        short: 'Dhaulagiri I',
        nep: 'धौलागिरी',
        lat: 28.6978,
        lon: 83.4906,
        elev: 8167,
        kind: 'peak',
        tier: 1,
        desc: 'World’s 7th highest peak (8,167 m), soaring nearly 6 km straight above the Kali Gandaki river floor.'
    },
    {
        id: 'manaslu',
        name: 'Manaslu',
        short: 'Manaslu',
        nep: 'मनास्लु',
        lat: 28.5556,
        lon: 84.5563,
        elev: 8163,
        kind: 'peak',
        tier: 2,
        desc: 'World’s 8th highest peak (8,163 m), rising over the Budhi Gandaki valley in Gorkha.'
    },
    {
        id: 'annapurna',
        name: 'Annapurna I',
        short: 'Annapurna I',
        nep: 'अन्नपूर्ण',
        lat: 28.5966,
        lon: 83.8202,
        elev: 8091,
        kind: 'peak',
        tier: 1,
        desc: 'World’s 10th highest peak (8,091 m); its massif blocks monsoon clouds, creating Mustang’s rain shadow to the north.'
    },
    {
        id: 'gaurishankar',
        name: 'Mt. Gaurishankar (UTC+5:45)',
        short: 'Gaurishankar',
        nep: 'गौरीशङ्कर',
        lat: 27.9580,
        lon: 86.3361,
        elev: 7134,
        kind: 'peak',
        tier: 2,
        meridian: true,
        desc: 'Sacred twin peak in Rolwaling whose 86°20′E meridian defines Nepal Standard Time (UTC+5:45).'
    },
    {
        id: 'machhapuchhre',
        name: 'Machhapuchhre',
        short: 'Machhapuchhre',
        nep: 'माछापुच्छ्रे',
        lat: 28.4977,
        lon: 83.9438,
        elev: 6993,
        kind: 'peak',
        tier: 2,
        desc: 'Sacred unclimbed “Fishtail” spire (6,993 m) rising dramatically just 28 km north of Pokhara.'
    },
    {
        id: 'api',
        name: 'Api Himal',
        short: 'Api Himal',
        nep: 'अपि हिमाल',
        lat: 30.0073,
        lon: 80.9280,
        elev: 7132,
        kind: 'peak',
        tier: 1,
        desc: 'Highest summit of Far-Western Nepal (7,132 m) in the Gurans Himal of Darchula.'
    },
    {
        id: 'limpiyadhura',
        name: 'Limpiyadhura',
        short: 'Limpiyadhura',
        nep: 'लिम्पियाधुरा',
        lat: 30.3650,
        lon: 80.6250,
        elev: 5530,
        kind: 'peak',
        tier: 2,
        desc: 'Northwestern Himalayan watershed headwaters of the Kali (Mahakali) River in Sudurpashchim.'
    },
    {
        id: 'kali-gandaki',
        name: 'Kali Gandaki Gorge',
        short: 'Kali Gandaki Gorge',
        nep: 'कालीगण्डकी गल्छी',
        lat: 28.6400,
        lon: 83.6600,
        elev: 2520,
        kind: 'water',
        tier: 2,
        desc: 'Deepest canyon on Earth — an antecedent river older than the Himalayas slicing between Dhaulagiri and Annapurna.'
    },
    {
        id: 'mustang',
        name: 'Upper Mustang (Lo Manthang)',
        short: 'Upper Mustang',
        nep: 'लो मान्थाङ',
        lat: 29.1830,
        lon: 83.9570,
        elev: 3840,
        kind: 'valley',
        tier: 2,
        desc: 'Arid Trans-Himalayan rain-shadow plateau lying north of the Annapurna and Dhaulagiri snow barrier.'
    },
    {
        id: 'rara',
        name: 'Rara Lake',
        short: 'Rara Lake',
        nep: 'रारा ताल',
        lat: 29.5250,
        lon: 82.0880,
        elev: 2990,
        kind: 'water',
        tier: 1,
        desc: 'Nepal’s largest lake (2,990 m), set in a forested alpine basin in Mugu, Karnali Province.'
    },
    {
        id: 'kathmandu',
        name: 'Kathmandu Valley',
        short: 'Kathmandu',
        nep: 'काठमाडौँ',
        lat: 27.7172,
        lon: 85.3240,
        elev: 1337,
        kind: 'valley',
        tier: 1,
        desc: 'Ancient drained lake bowl in the Pahad hills (1,337 m) ringed by Shivapuri, Phulchoki, Nagarjun & Chandragiri.'
    },
    {
        id: 'pokhara',
        name: 'Pokhara Valley',
        short: 'Pokhara',
        nep: 'पोखरा',
        lat: 28.2096,
        lon: 83.9856,
        elev: 822,
        kind: 'valley',
        tier: 1,
        desc: 'Subtropical lake valley (822 m) sitting directly beneath the 7,200 m vertical wall of the Annapurna Himal.'
    },
    {
        id: 'chitwan',
        name: 'Chitwan (Inner Terai)',
        short: 'Chitwan',
        nep: 'चितवन',
        lat: 27.5291,
        lon: 84.3542,
        elev: 150,
        kind: 'valley',
        tier: 1,
        desc: 'Classic Bhitri Madhesh (Dun valley) cradled between the young Chure hills and the Mahabharat range.'
    },
    {
        id: 'lumbini',
        name: 'Lumbini',
        short: 'Lumbini',
        nep: 'लुम्बिनी',
        lat: 27.4698,
        lon: 83.2757,
        elev: 105,
        kind: 'valley',
        tier: 1,
        desc: 'Birthplace of Siddhartha Gautama (the Buddha) on the fertile alluvial plains of the western Terai.'
    },
    {
        id: 'janakpur',
        name: 'Janakpur',
        short: 'Janakpur',
        nep: 'जनकपुर',
        lat: 26.7288,
        lon: 85.9263,
        elev: 74,
        kind: 'valley',
        tier: 2,
        desc: 'Historic cultural heart of Mithila in the eastern Madhesh plains (74 m).'
    },
    {
        id: 'kechana',
        name: 'Kechana Kalan (Jhapa)',
        short: 'Kechana · 60 m',
        nep: 'केचना कलन',
        lat: 26.4250,
        lon: 88.0450,
        elev: 60,
        kind: 'valley',
        tier: 2,
        desc: 'Nepal’s lowest elevation (~60 m) — less than 170 km south of 8,586 m Kangchenjunga.'
    }
];

const TOUR_STOPS = [
    {
        id: 'overview',
        label: 'Full Nepal',
        lon: 84.50,
        lat: 28.25,
        radius: null, // Computed dynamically from viewport aspect so 100% of Nepal fits with margin
        polar: 0.78, // ~44.7° from vertical (museum gallery overview)
        azimuth: -0.14,
        landmarkId: null
    },
    {
        id: 'everest-khumbu',
        label: 'Sagarmatha · Everest',
        lon: 86.90,
        lat: 27.93,
        radius: 2.35,
        polar: 1.03,
        azimuth: -0.28,
        landmarkId: 'everest'
    },
    {
        id: 'kali-gandaki',
        label: 'Kali Gandaki Gorge',
        lon: 83.72,
        lat: 28.66,
        radius: 2.45,
        polar: 1.08,
        azimuth: -0.06,
        landmarkId: 'kali-gandaki'
    },
    {
        id: 'kathmandu',
        label: 'Kathmandu Bowl',
        lon: 85.33,
        lat: 27.71,
        radius: 2.15,
        polar: 0.96,
        azimuth: 0.12,
        landmarkId: 'kathmandu'
    },
    {
        id: 'pokhara-annapurna',
        label: 'Pokhara → Annapurna',
        lon: 83.92,
        lat: 28.42,
        radius: 2.35,
        polar: 1.14,
        azimuth: -0.10,
        landmarkId: 'pokhara'
    },
    {
        id: 'gaurishankar-nst',
        label: 'UTC+5:45 Meridian',
        lon: 86.33,
        lat: 27.82,
        radius: 3.35,
        polar: 0.96,
        azimuth: -0.14,
        landmarkId: 'gaurishankar'
    },
    {
        id: 'limpiyadhura-west',
        label: 'Limpiyadhura & Far West',
        lon: 80.98,
        lat: 29.88,
        radius: 2.85,
        polar: 0.96,
        azimuth: 0.22,
        landmarkId: 'limpiyadhura'
    },
    {
        id: 'cross-section',
        label: '60 m → 8,849 m Profile',
        lon: 84.55,
        lat: 28.18,
        radius: 7.55,
        polar: 1.24, // low dramatic horizon angle from south
        azimuth: -0.24,
        landmarkId: null
    }
];

let cachedDataPromise = null;

async function loadImageRawBytes(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
    const blob = await res.blob();

    let source;
    if (typeof createImageBitmap === 'function') {
        try {
            source = await createImageBitmap(blob, {
                premultiplyAlpha: 'none',
                colorSpaceConversion: 'none'
            });
        } catch (_) {
            source = await createImageBitmap(blob);
        }
    } else {
        source = await new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = URL.createObjectURL(blob);
        });
    }

    const w = source.width;
    const h = source.height;
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(source, 0, 0);
    const data = new Uint8Array(ctx.getImageData(0, 0, w, h).data.buffer.slice(0));
    if (source.close) source.close();
    return { width: w, height: h, data };
}

function loadReliefDataset() {
    if (cachedDataPromise) return cachedDataPromise;

    cachedDataPromise = Promise.all([
        loadImageRawBytes('assets/nepal-dem.png'),
        loadImageRawBytes('assets/nepal-meta.png')
    ]).then(([demImg, metaImg]) => {
        const W = demImg.width;
        const H = demImg.height;
        const worldD = WORLD_W / (W / H);
        const halfD = worldD * 0.5;

        const count = W * H;
        const elevM = new Float32Array(count);
        const sdfPx = new Float32Array(count);

        const dBytes = demImg.data;
        for (let i = 0; i < count; i++) {
            const o = i * 4;
            const u16 = (dBytes[o] << 8) | dBytes[o + 1];
            elevM[i] = (u16 / 65535.0) * 9000.0;
            sdfPx[i] = (dBytes[o + 2] - 128.0) / 15.875;
        }

        // Lightly smoothed elevation solely for mesh vertex displacement (prevents triangle facet aliasing;
        // full 1440x836 sharp elevation is sampled per-pixel in the fragment shader!)
        const elevSmooth = new Float32Array(count);
        for (let y = 0; y < H; y++) {
            const ym = Math.max(0, y - 1) * W;
            const yc = y * W;
            const yp = Math.min(H - 1, y + 1) * W;
            for (let x = 0; x < W; x++) {
                const xm = Math.max(0, x - 1);
                const xp = Math.min(W - 1, x + 1);
                elevSmooth[yc + x] =
                    elevM[yc + x] * 0.44 +
                    (elevM[yc + xm] + elevM[yc + xp] + elevM[ym + x] + elevM[yp + x]) * 0.14;
            }
        }

        const { topGeometry, skirtGeometry } = buildClippedReliefGeometries(W, H, halfD, elevSmooth, sdfPx);

        return {
            W,
            H,
            worldD,
            halfD,
            demBytes: demImg.data,
            metaBytes: metaImg.data,
            elevM,
            sdfPx,
            topGeometry,
            skirtGeometry
        };
    });

    return cachedDataPromise;
}

function buildClippedReliefGeometries(W, H, halfD, elevSmooth, sdfPx) {
    const STEP = 3;
    const NX = Math.floor((W - 1) / STEP);
    const NZ = Math.floor((H - 1) / STEP);

    function bilerp(arr, fx, fy) {
        const x0 = Math.max(0, Math.min(W - 1, Math.floor(fx)));
        const y0 = Math.max(0, Math.min(H - 1, Math.floor(fy)));
        const x1 = Math.min(W - 1, x0 + 1);
        const y1 = Math.min(H - 1, y0 + 1);
        const tx = fx - x0;
        const ty = fy - y0;
        const v00 = arr[y0 * W + x0];
        const v10 = arr[y0 * W + x1];
        const v01 = arr[y1 * W + x0];
        const v11 = arr[y1 * W + x1];
        return (v00 * (1 - tx) + v10 * tx) * (1 - ty) + (v01 * (1 - tx) + v11 * tx) * ty;
    }

    function sdfGradOutward(fx, fy) {
        const xm = Math.max(0, fx - 1.2);
        const xp = Math.min(W - 1, fx + 1.2);
        const ym = Math.max(0, fy - 1.2);
        const yp = Math.min(H - 1, fy + 1.2);
        // SDF is positive inside, negative outside -> outward normal in (X, Z) is -grad(SDF)
        let gx = -(bilerp(sdfPx, xp, fy) - bilerp(sdfPx, xm, fy));
        let gz = -(bilerp(sdfPx, fx, yp) - bilerp(sdfPx, fx, ym));
        const len = Math.hypot(gx, gz) || 1.0;
        return [gx / len, gz / len];
    }

    const topPos = [];
    const topUV = [];
    const topIdx = [];

    const cornerCache = new Int32Array((NX + 1) * (NZ + 1)).fill(-1);
    const hEdgeCache = new Int32Array(NX * (NZ + 1)).fill(-1);
    const vEdgeCache = new Int32Array((NX + 1) * NZ).fill(-1);

    function addTopVertex(fx, fy) {
        const u = fx / (W - 1);
        const v = fy / (H - 1);
        const wx = (u - 0.5) * WORLD_W;
        const wz = (v - 0.5) * (halfD * 2.0);
        const el = bilerp(elevSmooth, fx, fy);
        const idx = topPos.length / 3;
        topPos.push(wx, el, wz);
        topUV.push(u, v);
        return idx;
    }

    function getCornerIdx(ix, iz) {
        const key = iz * (NX + 1) + ix;
        if (cornerCache[key] !== -1) return cornerCache[key];
        const idx = addTopVertex(ix * STEP, iz * STEP);
        cornerCache[key] = idx;
        return idx;
    }

    function getHEdgeCut(ix, iz, t) {
        const key = iz * NX + ix;
        if (hEdgeCache[key] !== -1) return hEdgeCache[key];
        const idx = addTopVertex((ix + t) * STEP, iz * STEP);
        hEdgeCache[key] = idx;
        return idx;
    }

    function getVEdgeCut(ix, iz, t) {
        const key = iz * (NX + 1) + ix;
        if (vEdgeCache[key] !== -1) return vEdgeCache[key];
        const idx = addTopVertex(ix * STEP, (iz + t) * STEP);
        vEdgeCache[key] = idx;
        return idx;
    }

    function nodeSdf(ix, iz) {
        const s = sdfPx[iz * STEP * W + ix * STEP];
        return s === 0.0 ? 1e-5 : s;
    }

    // Skirt arrays (vertical geological plinth around Nepal's exact boundary)
    const skirtPos = [];
    const skirtNorm = [];
    const skirtRim = [];
    const skirtUV = [];
    const skirtIdx = [];

    function addSkirtSegment(topIdxA, topIdxB) {
        const ax = topPos[topIdxA * 3];
        const ay = topPos[topIdxA * 3 + 1];
        const az = topPos[topIdxA * 3 + 2];
        const au = topUV[topIdxA * 2];
        const av = topUV[topIdxA * 2 + 1];

        const bx = topPos[topIdxB * 3];
        const by = topPos[topIdxB * 3 + 1];
        const bz = topPos[topIdxB * 3 + 2];
        const bu = topUV[topIdxB * 2];
        const bv = topUV[topIdxB * 2 + 1];

        const [nax, naz] = sdfGradOutward(au * (W - 1), av * (H - 1));
        const [nbx, nbz] = sdfGradOutward(bu * (W - 1), bv * (H - 1));

        const base = skirtPos.length / 3;
        // 0: A_top, 1: A_bot, 2: B_bot, 3: B_top
        skirtPos.push(ax, ay, az, ax, 0, az, bx, 0, bz, bx, by, bz);
        skirtNorm.push(nax, 0, naz, nax, 0, naz, nbx, 0, nbz, nbx, 0, nbz);
        skirtRim.push(0, 1, 1, 0);
        skirtUV.push(au, av, au, av, bu, bv, bu, bv);

        // CCW outward winding verified: (A_top, A_bot, B_bot) and (A_top, B_bot, B_top)
        skirtIdx.push(base, base + 1, base + 2, base, base + 2, base + 3);
    }

    // Walk every cell in CCW order for +Y upward normal:
    // c0=(ix, iz) [NW] -> c1=(ix, iz+1) [SW] -> c2=(ix+1, iz+1) [SE] -> c3=(ix+1, iz) [NE]
    for (let iz = 0; iz < NZ; iz++) {
        for (let ix = 0; ix < NX; ix++) {
            const s0 = nodeSdf(ix, iz);
            const s1 = nodeSdf(ix, iz + 1);
            const s2 = nodeSdf(ix + 1, iz + 1);
            const s3 = nodeSdf(ix + 1, iz);

            if (s0 < 0 && s1 < 0 && s2 < 0 && s3 < 0) continue;

            if (s0 >= 0 && s1 >= 0 && s2 >= 0 && s3 >= 0) {
                const i0 = getCornerIdx(ix, iz);
                const i1 = getCornerIdx(ix, iz + 1);
                const i2 = getCornerIdx(ix + 1, iz + 1);
                const i3 = getCornerIdx(ix + 1, iz);

                // Choose quad diagonal with smaller elevation difference for cleaner ridge lines
                const d02 = Math.abs(topPos[i0 * 3 + 1] - topPos[i2 * 3 + 1]);
                const d13 = Math.abs(topPos[i1 * 3 + 1] - topPos[i3 * 3 + 1]);
                if (d02 <= d13) {
                    topIdx.push(i0, i1, i2, i0, i2, i3);
                } else {
                    topIdx.push(i0, i1, i3, i1, i2, i3);
                }
                continue;
            }

            // Boundary-crossing cell: clip polygon against SDF >= 0
            const sArr = [s0, s1, s2, s3];
            const poly = []; // { idx, isCut }

            for (let k = 0; k < 4; k++) {
                const sk = sArr[k];
                const sn = sArr[(k + 1) & 3];

                if (sk >= 0) {
                    let cIdx;
                    if (k === 0) cIdx = getCornerIdx(ix, iz);
                    else if (k === 1) cIdx = getCornerIdx(ix, iz + 1);
                    else if (k === 2) cIdx = getCornerIdx(ix + 1, iz + 1);
                    else cIdx = getCornerIdx(ix + 1, iz);
                    poly.push({ idx: cIdx, isCut: false });
                }

                if ((sk >= 0) !== (sn >= 0)) {
                    let cutIdx;
                    if (k === 0) {
                        // (ix, iz) -> (ix, iz+1)
                        const t = sk / (sk - sn);
                        cutIdx = getVEdgeCut(ix, iz, t);
                    } else if (k === 1) {
                        // (ix, iz+1) -> (ix+1, iz+1)
                        const t = sk / (sk - sn);
                        cutIdx = getHEdgeCut(ix, iz + 1, t);
                    } else if (k === 2) {
                        // (ix+1, iz+1) -> (ix+1, iz) : convert to top->bottom param from iz
                        const tFromTop = s3 / (s3 - s2);
                        cutIdx = getVEdgeCut(ix + 1, iz, tFromTop);
                    } else {
                        // (ix+1, iz) -> (ix, iz) : convert to left->right param from ix
                        const tFromLeft = s0 / (s0 - s3);
                        cutIdx = getHEdgeCut(ix, iz, tFromLeft);
                    }
                    poly.push({ idx: cutIdx, isCut: true });
                }
            }

            const n = poly.length;
            if (n < 3) continue;

            if (n === 6 && (s0 + s1 + s2 + s3) < 0) {
                // Disconnected saddle: two separate corner triangles
                if (s0 >= 0) {
                    // poly = [c0, cut0, cut1, c2, cut2, cut3]
                    topIdx.push(poly[0].idx, poly[1].idx, poly[5].idx);
                    topIdx.push(poly[3].idx, poly[4].idx, poly[2].idx);
                    addSkirtSegment(poly[1].idx, poly[5].idx);
                    addSkirtSegment(poly[4].idx, poly[2].idx);
                } else {
                    // s1 >= 0 && s3 >= 0 -> poly = [cut0, c1, cut1, cut2, c3, cut3]
                    topIdx.push(poly[0].idx, poly[1].idx, poly[2].idx);
                    topIdx.push(poly[3].idx, poly[4].idx, poly[5].idx);
                    addSkirtSegment(poly[2].idx, poly[0].idx);
                    addSkirtSegment(poly[5].idx, poly[3].idx);
                }
            } else {
                for (let m = 1; m < n - 1; m++) {
                    topIdx.push(poly[0].idx, poly[m].idx, poly[m + 1].idx);
                }
                for (let m = 0; m < n; m++) {
                    const a = poly[m];
                    const b = poly[(m + 1) % n];
                    if (a.isCut && b.isCut) {
                        addSkirtSegment(a.idx, b.idx);
                    }
                }
            }
        }
    }

    const topGeometry = new THREE.BufferGeometry();
    topGeometry.setAttribute('position', new THREE.Float32BufferAttribute(topPos, 3));
    topGeometry.setAttribute('uv', new THREE.Float32BufferAttribute(topUV, 2));
    topGeometry.setIndex(topPos.length / 3 > 65535 ? new THREE.Uint32BufferAttribute(topIdx, 1) : new THREE.Uint16BufferAttribute(topIdx, 1));

    const skirtGeometry = new THREE.BufferGeometry();
    skirtGeometry.setAttribute('position', new THREE.Float32BufferAttribute(skirtPos, 3));
    skirtGeometry.setAttribute('normal', new THREE.Float32BufferAttribute(skirtNorm, 3));
    skirtGeometry.setAttribute('aRim', new THREE.Float32BufferAttribute(skirtRim, 1));
    skirtGeometry.setAttribute('uv', new THREE.Float32BufferAttribute(skirtUV, 2));
    skirtGeometry.setIndex(skirtPos.length / 3 > 65535 ? new THREE.Uint32BufferAttribute(skirtIdx, 1) : new THREE.Uint16BufferAttribute(skirtIdx, 1));

    return { topGeometry, skirtGeometry };
}

function createTerrainMaterial(demTex, metaTex, texW, texH) {
    return new THREE.ShaderMaterial({
        uniforms: {
            uDemTex: { value: demTex },
            uMetaTex: { value: metaTex },
            uTexSize: { value: new THREE.Vector2(texW, texH) },
            uExaggeration: { value: 4.0 },
            uMeterToWorld: { value: METER_TO_WORLD },
            uPlinthHeight: { value: PLINTH_HEIGHT },
            uMode: { value: 0 }, // 0=natural, 1=ecological belts, 2=7 provinces, 3=museum plaster
            uFocusId: { value: 0 }, // 0=none, 1..3 eco or 1..7 prov
            uDarkTheme: { value: 0.0 },
            uShowMeridian: { value: 0.0 },
            uHoverUV: { value: new THREE.Vector2(-1, -1) }
        },
        vertexShader: /* glsl */ `
            uniform float uExaggeration;
            uniform float uMeterToWorld;
            uniform float uPlinthHeight;

            varying vec2 vUv;
            varying vec3 vWorldPos;
            varying float vElevM;

            void main() {
                vUv = uv;
                vElevM = position.y;
                float wy = position.y * uMeterToWorld * uExaggeration + uPlinthHeight;
                vec3 displaced = vec3(position.x, wy, position.z);
                vec4 wp = modelMatrix * vec4(displaced, 1.0);
                vWorldPos = wp.xyz;
                gl_Position = projectionMatrix * viewMatrix * wp;
            }
        `,
        fragmentShader: /* glsl */ `
            precision highp float;

            uniform sampler2D uDemTex;
            uniform sampler2D uMetaTex;
            uniform vec2 uTexSize;
            uniform float uExaggeration;
            uniform int uMode;
            uniform int uFocusId;
            uniform float uDarkTheme;
            uniform float uShowMeridian;
            uniform vec2 uHoverUV;

            varying vec2 vUv;
            varying vec3 vWorldPos;
            varying float vElevM;

            float decodeElevTexel(vec2 ij) {
                vec2 uv = (clamp(ij, vec2(0.0), uTexSize - 1.0) + 0.5) / uTexSize;
                vec4 t = texture2D(uDemTex, uv);
                float hi = floor(t.r * 255.0 + 0.5);
                float lo = floor(t.g * 255.0 + 0.5);
                return ((hi * 256.0 + lo) / 65535.0) * 9000.0;
            }

            float sampleElevSmooth(vec2 uv) {
                vec2 p = uv * (uTexSize - 1.0);
                vec2 i0 = floor(p);
                vec2 f = p - i0;
                float e00 = decodeElevTexel(i0);
                float e10 = decodeElevTexel(i0 + vec2(1.0, 0.0));
                float e01 = decodeElevTexel(i0 + vec2(0.0, 1.0));
                float e11 = decodeElevTexel(i0 + vec2(1.0, 1.0));
                return mix(mix(e00, e10, f.x), mix(e01, e11, f.x), f.y);
            }

            float sampleSdfPx(vec2 uv) {
                vec2 p = uv * (uTexSize - 1.0);
                vec2 i0 = floor(p);
                vec2 f = p - i0;
                vec2 u00 = (i0 + 0.5) / uTexSize;
                vec2 stepUv = 1.0 / uTexSize;
                float s00 = texture2D(uDemTex, u00).b;
                float s10 = texture2D(uDemTex, u00 + vec2(stepUv.x, 0.0)).b;
                float s01 = texture2D(uDemTex, u00 + vec2(0.0, stepUv.y)).b;
                float s11 = texture2D(uDemTex, u00 + stepUv).b;
                float sb = mix(mix(s00, s10, f.x), mix(s01, s11, f.x), f.y);
                return (sb * 255.0 - 128.0) / 15.875;
            }

            float sampleChannelBilinear(vec2 uv, int ch) {
                vec2 p = uv * (uTexSize - 1.0);
                vec2 i0 = floor(p);
                vec2 f = p - i0;
                vec2 u00 = (i0 + 0.5) / uTexSize;
                vec2 st = 1.0 / uTexSize;
                vec4 m00 = texture2D(uMetaTex, u00);
                vec4 m10 = texture2D(uMetaTex, u00 + vec2(st.x, 0.0));
                vec4 m01 = texture2D(uMetaTex, u00 + vec2(0.0, st.y));
                vec4 m11 = texture2D(uMetaTex, u00 + st);
                if (ch == 1) {
                    return mix(mix(m00.g, m10.g, f.x), mix(m01.g, m11.g, f.x), f.y);
                }
                return mix(mix(m00.b, m10.b, f.x), mix(m01.b, m11.b, f.x), f.y);
            }

            vec3 naturalHypsometricColor(float elev, float slope, float latNorm, float river) {
                // Physically grounded Nepali ecological hypsometry (Terai -> Siwalik -> Pahad -> Alpine -> Himal)
                vec3 cTeraiLow  = vec3(0.275, 0.515, 0.318);
                vec3 cTeraiUp   = vec3(0.395, 0.588, 0.358);
                vec3 cSiwalik   = vec3(0.555, 0.635, 0.415);
                vec3 cPahad     = vec3(0.692, 0.635, 0.455);
                vec3 cSubalpine = vec3(0.585, 0.505, 0.408);
                vec3 cTransArid = vec3(0.695, 0.605, 0.478); // Rain-shadow Mustang / Dolpo buff ochre
                vec3 cAlpineRock= vec3(0.455, 0.448, 0.458);
                vec3 cGlacier   = vec3(0.815, 0.862, 0.915);
                vec3 cSnow      = vec3(0.985, 0.990, 1.000);

                vec3 col = cTeraiLow;
                col = mix(col, cTeraiUp,   smoothstep(65.0,  280.0, elev));
                col = mix(col, cSiwalik,   smoothstep(280.0, 880.0, elev));
                col = mix(col, cPahad,     smoothstep(880.0, 1950.0, elev));

                // Northern rain-shadow warmth in Trans-Himalaya (Mustang, Dolpo, Humla)
                float transFactor = smoothstep(0.45, 0.78, 1.0 - latNorm) * smoothstep(2400.0, 3600.0, elev) * (1.0 - smoothstep(4600.0, 5400.0, elev));
                vec3 midHigh = mix(cSubalpine, cTransArid, transFactor * 0.72);
                col = mix(col, midHigh,    smoothstep(1950.0, 3200.0, elev));
                col = mix(col, cAlpineRock,smoothstep(3200.0, 4450.0, elev));

                // Snowline rises slightly on steep cliffs so Himalayan granite faces peek through!
                float cliffSteep = smoothstep(0.42, 0.82, slope);
                float snowStart = 4750.0 + cliffSteep * 780.0;
                float iceMix = smoothstep(snowStart, snowStart + 620.0, elev);
                float pureSnow = smoothstep(snowStart + 450.0, 6800.0, elev) * (1.0 - cliffSteep * 0.48);
                col = mix(col, cGlacier, iceMix);
                col = mix(col, cSnow, pureSnow);

                // Glacier-fed Himalayan river network
                float rMask = smoothstep(0.10, 0.62, river) * (1.0 - smoothstep(4300.0, 4900.0, elev));
                vec3 cRiver = mix(vec3(0.145, 0.435, 0.655), vec3(0.215, 0.545, 0.745), smoothstep(200.0, 2800.0, elev));
                col = mix(col, cRiver, rMask * 0.76);

                return col;
            }

            vec3 ecologicalColor(int zoneId, float elev, float river, out int ecoGroup) {
                ecoGroup = 2;
                vec3 base = vec3(0.83, 0.53, 0.24);
                if (zoneId == 1) {
                    ecoGroup = 1; // Terai
                    base = mix(vec3(0.17, 0.59, 0.39), vec3(0.27, 0.69, 0.46), smoothstep(60.0, 350.0, elev));
                } else if (zoneId == 2) {
                    ecoGroup = 2; // Hills - Chure/Siwalik
                    base = vec3(0.78, 0.57, 0.25);
                } else if (zoneId == 3) {
                    ecoGroup = 2; // Hills - Pahad Midlands
                    base = mix(vec3(0.84, 0.51, 0.23), vec3(0.75, 0.43, 0.21), smoothstep(900.0, 2700.0, elev));
                } else if (zoneId == 4) {
                    ecoGroup = 3; // Himal - High Mountains
                    base = vec3(0.32, 0.54, 0.88);
                } else {
                    ecoGroup = 3; // Himal - High Himalaya
                    base = mix(vec3(0.46, 0.69, 0.97), vec3(0.93, 0.96, 1.0), smoothstep(4500.0, 6800.0, elev));
                }
                float rMask = smoothstep(0.18, 0.72, river) * 0.35;
                return mix(base, vec3(0.10, 0.32, 0.54), rMask);
            }

            vec3 provinceColor(int provId) {
                if (provId == 1) return vec3(0.32, 0.56, 0.85); // Koshi
                if (provId == 2) return vec3(0.25, 0.64, 0.47); // Madhesh
                if (provId == 3) return vec3(0.85, 0.49, 0.27); // Bagmati
                if (provId == 4) return vec3(0.57, 0.45, 0.84); // Gandaki
                if (provId == 5) return vec3(0.79, 0.63, 0.24); // Lumbini
                if (provId == 6) return vec3(0.29, 0.65, 0.66); // Karnali
                return vec3(0.81, 0.41, 0.48);                  // Sudurpashchim
            }

            void main() {
                vec2 stepUv = 1.0 / uTexSize;
                float eC = sampleElevSmooth(vUv);
                float eL = sampleElevSmooth(vUv - vec2(stepUv.x, 0.0));
                float eR = sampleElevSmooth(vUv + vec2(stepUv.x, 0.0));
                float eU = sampleElevSmooth(vUv - vec2(0.0, stepUv.y));
                float eD = sampleElevSmooth(vUv + vec2(0.0, stepUv.y));

                // Cell spacing ~567m; scale normal with uExaggeration so lighting responds organically
                float cellSpan = 1134.0;
                float reliefBoost = mix(2.2, max(2.2, uExaggeration * 0.95), 0.85);
                vec3 n = normalize(vec3((eL - eR) * reliefBoost, cellSpan, (eU - eD) * reliefBoost));
                float slope = 1.0 - clamp(n.y, 0.0, 1.0);

                // Unpack integer metadata at nearest texel + smooth river & sky-view AO
                vec2 nearUv = (floor(vUv * (uTexSize - 1.0) + 0.5) + 0.5) / uTexSize;
                float metaByte = floor(texture2D(uMetaTex, nearUv).r * 255.0 + 0.5);
                int zoneId = int(mod(metaByte, 8.0));
                int provId = int(mod(floor(metaByte / 8.0), 8.0));
                float provEdge = floor(metaByte / 64.0) / 3.0;

                float river = sampleChannelBilinear(vUv, 1);
                float svf = sampleChannelBilinear(vUv, 2);

                vec3 albedo;
                if (uMode == 0) {
                    albedo = naturalHypsometricColor(eC, slope, vUv.y, river);
                } else if (uMode == 1) {
                    int ecoGroup;
                    albedo = ecologicalColor(zoneId, eC, river, ecoGroup);
                    if (uFocusId > 0 && ecoGroup != uFocusId) {
                        float lum = dot(albedo, vec3(0.299, 0.587, 0.114));
                        albedo = mix(vec3(lum), albedo, 0.18) * 0.62;
                    }
                } else if (uMode == 2) {
                    albedo = provinceColor(provId);
                    albedo = mix(albedo, vec3(0.95, 0.97, 1.0), smoothstep(5000.0, 7200.0, eC) * 0.42);
                    if (uFocusId > 0 && provId != uFocusId) {
                        float lum = dot(albedo, vec3(0.299, 0.587, 0.114));
                        albedo = mix(vec3(lum), albedo, 0.16) * 0.58;
                    }
                    albedo = mix(albedo, vec3(0.14, 0.16, 0.20), provEdge * 0.68);
                } else {
                    // Museum Alabaster / Architectural Cast Plaster Sculpture
                    vec3 plasterLight = vec3(0.945, 0.930, 0.898);
                    vec3 plasterDark  = vec3(0.835, 0.828, 0.808);
                    albedo = mix(plasterLight, plasterDark, uDarkTheme);
                    // Subtle engraved river channels in plaster
                    albedo *= (1.0 - smoothstep(0.18, 0.75, river) * 0.085);
                }

                // Eduard Imhof Swiss dual-light museum relief illumination + 16-azimuth Sky-View AO
                vec3 sunDir  = normalize(vec3(-0.56, 0.62, -0.55)); // NW warm studio key light
                vec3 fillDir = normalize(vec3(0.48, 0.46, 0.75));   // SE cool gallery sky fill

                float keyDiff  = max(dot(n, sunDir), 0.0);
                float fillDiff = max(dot(n, fillDir), 0.0);
                float ao = mix(0.44, 1.0, pow(clamp(svf, 0.0, 1.0), 0.85));

                vec3 viewDir = normalize(cameraPosition - vWorldPos);
                vec3 halfVec = normalize(sunDir + viewDir);
                float snowSpec = pow(max(dot(n, halfVec), 0.0), 28.0) * smoothstep(4800.0, 6500.0, eC) * 0.18;

                vec3 lightSum =
                    vec3(1.03, 0.99, 0.94) * (keyDiff * 0.82) +
                    vec3(0.76, 0.84, 0.96) * (fillDiff * 0.26) +
                    vec3(0.92, 0.94, 0.98) * 0.28;

                vec3 color = albedo * lightSum * ao + vec3(snowSpec);

                // Subtle 1,000m museum hypsometric contour whisper in Plaster & Ecological modes
                if (uMode == 1 || uMode == 3) {
                    float cStep = abs(fract(eC / 1000.0 + 0.5) - 0.5);
                    float cLine = 1.0 - smoothstep(0.008, 0.022, cStep);
                    color = mix(color, color * 0.84, cLine * 0.35 * smoothstep(200.0, 900.0, eC));
                }

                // Optional 86°20'E Mount Gaurishankar Nepal Standard Time (UTC+5:45) meridian inlay
                if (uShowMeridian > 0.01) {
                    float lon = mix(79.96, 88.30, vUv.x);
                    float dLon = abs(lon - 86.33333);
                    float mLine = 1.0 - smoothstep(0.003, 0.011, dLon);
                    float mGlow = 1.0 - smoothstep(0.010, 0.042, dLon);
                    color = mix(color, vec3(0.99, 0.80, 0.22), mLine * 0.92 * uShowMeridian);
                    color += vec3(0.95, 0.68, 0.14) * (mGlow * 0.14 * uShowMeridian);
                }

                // Soft cursor inspection spotlight ring
                if (uHoverUV.x >= 0.0) {
                    vec2 aspectVec = (vUv - uHoverUV) * vec2(1.722, 1.0);
                    float dHov = length(aspectVec);
                    float ring = (1.0 - smoothstep(0.0035, 0.0065, abs(dHov - 0.011))) * 0.55;
                    color = mix(color, vec3(1.0, 0.96, 0.84), ring);
                }

                // Crisp milled rim highlight right along Nepal's perimeter
                float sdf = sampleSdfPx(vUv);
                float rimBevel = 1.0 - smoothstep(0.0, 1.35, abs(sdf));
                color = mix(color, color * 1.09 + vec3(0.03), rimBevel * 0.45);

                // Tone curve
                color = pow(clamp(color, 0.0, 1.0), vec3(0.96));
                gl_FragColor = vec4(color, 1.0);
            }
        `
    });
}

function createSkirtMaterial() {
    return new THREE.ShaderMaterial({
        side: THREE.DoubleSide,
        uniforms: {
            uExaggeration: { value: 4.0 },
            uMeterToWorld: { value: METER_TO_WORLD },
            uPlinthHeight: { value: PLINTH_HEIGHT },
            uDarkTheme: { value: 0.0 }
        },
        vertexShader: /* glsl */ `
            attribute float aRim;

            uniform float uExaggeration;
            uniform float uMeterToWorld;
            uniform float uPlinthHeight;

            varying vec3 vNormalW;
            varying float vRim;
            varying float vHeightFrac;

            void main() {
                vRim = aRim;
                float topY = position.y * uMeterToWorld * uExaggeration + uPlinthHeight;
                float wy = mix(topY, 0.0, aRim);
                vHeightFrac = clamp(wy / 0.55, 0.0, 1.0);
                vNormalW = normalize(mat3(modelMatrix) * normal);
                vec4 wp = modelMatrix * vec4(position.x, wy, position.z, 1.0);
                gl_Position = projectionMatrix * viewMatrix * wp;
            }
        `,
        fragmentShader: /* glsl */ `
            precision highp float;

            uniform float uDarkTheme;

            varying vec3 vNormalW;
            varying float vRim;
            varying float vHeightFrac;

            void main() {
                vec3 n = normalize(vNormalW);
                vec3 sunDir = normalize(vec3(-0.56, 0.45, -0.55));
                vec3 fillDir = normalize(vec3(0.48, 0.35, 0.75));
                float lit = 0.46 + 0.44 * max(dot(n, sunDir), 0.0) + 0.20 * max(dot(n, fillDir), 0.0);

                // Warm architectural limestone / slate crustal cross-section plinth
                vec3 lightStoneTop = vec3(0.72, 0.67, 0.60);
                vec3 lightStoneBot = vec3(0.51, 0.47, 0.43);
                vec3 darkStoneTop  = vec3(0.45, 0.46, 0.50);
                vec3 darkStoneBot  = vec3(0.24, 0.25, 0.29);

                vec3 topCol = mix(lightStoneTop, darkStoneTop, uDarkTheme);
                vec3 botCol = mix(lightStoneBot, darkStoneBot, uDarkTheme);
                vec3 base = mix(topCol, botCol, pow(vRim, 0.78));

                // Subtle geological sedimentary strata lines in crustal cross-section
                float strata = sin(vHeightFrac * 95.0) * 0.5 + 0.5;
                base *= (0.965 + 0.05 * strata);

                // Crisp grounded base contact line at y=0
                float foot = smoothstep(0.84, 1.0, vRim);
                base *= (1.0 - 0.22 * foot);

                gl_FragColor = vec4(base * lit, 1.0);
            }
        `
    });
}

function createShadowMaterial(demTex, texW, texH) {
    return new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        uniforms: {
            uDemTex: { value: demTex },
            uTexSize: { value: new THREE.Vector2(texW, texH) },
            uExaggeration: { value: 4.0 },
            uDarkTheme: { value: 0.0 }
        },
        vertexShader: /* glsl */ `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: /* glsl */ `
            precision highp float;

            uniform sampler2D uDemTex;
            uniform vec2 uTexSize;
            uniform float uExaggeration;
            uniform float uDarkTheme;

            varying vec2 vUv;

            float sdfAt(vec2 uv) {
                if (uv.x <= 0.005 || uv.x >= 0.995 || uv.y <= 0.005 || uv.y >= 0.995) return -8.0;
                float sb = texture2D(uDemTex, uv).b;
                return (sb * 255.0 - 128.0) / 15.875;
            }

            void main() {
                // Multi-tap soft museum table contact + SE directional cast shadow
                vec2 sunOffset = vec2(-0.0065, -0.0095) * clamp(uExaggeration / 4.0, 0.4, 1.7);
                float acc = 0.0;
                for (int j = -1; j <= 1; j++) {
                    for (int i = -1; i <= 1; i++) {
                        vec2 off = sunOffset + vec2(float(i), float(j)) * vec2(0.0038, 0.0062);
                        float s = sdfAt(vUv + off);
                        acc += smoothstep(-7.5, 1.2, s);
                    }
                }
                float castShadow = acc / 9.0;
                float contact = smoothstep(-3.2, 0.8, sdfAt(vUv));

                // Guarantee 0.000 alpha near canvas perimeter so zero rectangle is ever visible
                vec2 edgeFadeVec = smoothstep(vec2(0.0), vec2(0.045, 0.065), vUv) *
                                   smoothstep(vec2(0.0), vec2(0.045, 0.065), 1.0 - vUv);
                float edgeMask = edgeFadeVec.x * edgeFadeVec.y;

                float strength = mix(0.165, 0.42, uDarkTheme);
                float alpha = clamp((castShadow * 0.72 + contact * 0.45) * strength * edgeMask, 0.0, 0.55);

                vec3 shadowHue = mix(vec3(0.07, 0.09, 0.13), vec3(0.01, 0.01, 0.02), uDarkTheme);
                gl_FragColor = vec4(shadowHue, alpha);
            }
        `
    });
}

class NepalReliefInstance {
    constructor(rootEl, dataset) {
        this.root = rootEl;
        this.data = dataset;
        this.disposed = false;
        this.visible = true;

        // Interactive state
        this.mode = 0;
        this.focusId = 0;
        this.showLabels = true;
        this.selectedLandmark = null;
        this.activeTourId = 'overview';

        this.targetExag = 4.0;
        this.currentExag = 0.35; // Rises tectonically on entrance!
        this.targetMeridian = 0.0;
        this.currentMeridian = 0.0;

        // Spherical orbit camera state (compensated for perspective foreshortening along NW->SE axis)
        this.target = new THREE.Vector3(0.44, 0.14, 0.22);
        this.goalTarget = this.target.clone();
        this.spherical = { radius: 10.7, polar: 0.52, azimuth: -0.14 };
        this.goalSpherical = { radius: 10.7, polar: 0.78, azimuth: -0.14 };

        this.isDragging = false;
        this.isPinching = false;
        this.safariGestureActive = false;
        this.gestureLastScale = 1.0;
        this.gestureLastRotation = 0;
        this.touchOrbitActive = false;
        this.lastTouchAngle = null;
        this.pinchClearTimer = null;
        this.pointerDownPos = { x: 0, y: 0 };
        this.lastPointer = { x: 0, y: 0 };
        this.lastPinchDist = 0;
        this.lastPinchMid = null;
        this.rafId = null;

        this.buildDOM();
        this.initThree();
        this.bindEvents();
        this.syncTheme();
        this.updateLegendStrip();
        this.requestFrame();
    }

    buildDOM() {
        this.root.innerHTML = `
            <div class="nr-telemetry-bar">
                <div class="nr-readout" id="nr-readout">
                    <strong>60 m → 8,848.86 m</strong>
                    <span class="nr-readout-sep">·</span>
                    <span>Pinch to zoom in &amp; out · Drag sculpture to tilt &amp; orbit</span>
                </div>
                <div class="nr-quick-tools">
                    <button type="button" class="nr-icon-btn" data-action="zoom-in" title="Zoom in" aria-label="Zoom in">+</button>
                    <button type="button" class="nr-icon-btn" data-action="zoom-out" title="Zoom out" aria-label="Zoom out">−</button>
                    <button type="button" class="nr-icon-btn" data-action="labels" aria-pressed="true" title="Toggle landmark pins">Pins</button>
                    <button type="button" class="nr-icon-btn" data-action="reset" title="Reset camera to north-up overview">
                        <svg class="nr-compass-needle" id="nr-compass-svg" viewBox="0 0 24 24" fill="none">
                            <polygon points="12,2 15.5,12 12,10 8.5,12" fill="#dc2626"/>
                            <polygon points="12,22 15.5,12 12,14 8.5,12" fill="currentColor" opacity="0.45"/>
                        </svg>
                        <span>Reset</span>
                    </button>
                </div>
            </div>

            <div class="nr-viewport" id="nr-viewport">
                <canvas class="nr-canvas" id="nr-canvas"></canvas>
                <div class="nr-markers-layer" id="nr-markers"></div>
                <div class="nr-placard nr-hidden" id="nr-placard" role="region" aria-live="polite">
                    <div class="nr-placard-head">
                        <div class="nr-placard-title">
                            <span id="nr-placard-name"></span>
                            <span class="nr-placard-nep" id="nr-placard-nep"></span>
                        </div>
                        <button type="button" class="nr-placard-close" id="nr-placard-close" aria-label="Close details">×</button>
                    </div>
                    <div class="nr-placard-meta" id="nr-placard-meta"></div>
                    <p class="nr-placard-desc" id="nr-placard-desc"></p>
                </div>
            </div>

            <div class="nr-controls-wrap">
                <div class="nr-bar-row">
                    <div class="nr-pill-group" role="tablist" aria-label="Surface map style">
                        <span class="nr-row-label">Surface</span>
                        <button type="button" class="nr-pill nr-active" data-mode="0">Natural Relief</button>
                        <button type="button" class="nr-pill" data-mode="1">Ecological Belts</button>
                        <button type="button" class="nr-pill" data-mode="2">7 Provinces</button>
                        <button type="button" class="nr-pill" data-mode="3">Museum Plaster</button>
                    </div>
                    <div class="nr-pill-group" aria-label="Vertical relief scale">
                        <span class="nr-row-label">Relief</span>
                        <button type="button" class="nr-pill nr-pill--tour" data-exag="1.3">1× True</button>
                        <button type="button" class="nr-pill nr-pill--tour nr-active" data-exag="4.0">4× Museum</button>
                        <button type="button" class="nr-pill nr-pill--tour" data-exag="6.5">6.5× Steep</button>
                    </div>
                </div>

                <div class="nr-legend-strip nr-hidden" id="nr-legend-strip"></div>

                <div class="nr-bar-row">
                    <div class="nr-pill-group" id="nr-tour-group" aria-label="Guided 3D camera views">
                        <span class="nr-row-label">Explore</span>
                        ${TOUR_STOPS.map((t, idx) => `
                            <button type="button" class="nr-pill nr-pill--tour${idx === 0 ? ' nr-active' : ''}" data-tour="${t.id}">${t.label}</button>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        this.viewportEl = this.root.querySelector('#nr-viewport');
        this.canvasEl = this.root.querySelector('#nr-canvas');
        this.readoutEl = this.root.querySelector('#nr-readout');
        this.markersEl = this.root.querySelector('#nr-markers');
        this.compassEl = this.root.querySelector('#nr-compass-svg');
        this.placardEl = this.root.querySelector('#nr-placard');
        this.legendEl = this.root.querySelector('#nr-legend-strip');

        // Build landmark pins
        this.pinItems = LANDMARKS.map(lm => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = `nr-pin nr-pin--${lm.kind}`;
            btn.dataset.id = lm.id;
            const elevLabel = `${lm.elev.toLocaleString()} m`;
            btn.innerHTML = `
                <span class="nr-pin-tag">
                    <span>${lm.short}</span>
                    <span class="nr-pin-elev">${elevLabel}</span>
                </span>
                <span class="nr-pin-stem"></span>
                <span class="nr-pin-dot"></span>
            `;
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.focusLandmark(lm);
            });
            this.markersEl.appendChild(btn);

            const { x, z, elev } = this.lonLatToWorld(lm.lon, lm.lat);
            return { lm, el: btn, wx: x, wz: z, elev: Math.max(elev, lm.elev * 0.92) };
        });
    }

    initThree() {
        const { W, H, worldD, demBytes, metaBytes, topGeometry, skirtGeometry } = this.data;

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(34, 1.8, 0.025, 65.0);

        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvasEl,
            alpha: true,
            antialias: true,
            powerPreference: 'high-performance'
        });
        this.renderer.setClearColor(0x000000, 0.0);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

        this.demTex = new THREE.DataTexture(demBytes, W, H, THREE.RGBAFormat, THREE.UnsignedByteType);
        this.demTex.colorSpace = THREE.NoColorSpace;
        this.demTex.minFilter = THREE.NearestFilter;
        this.demTex.magFilter = THREE.NearestFilter;
        this.demTex.generateMipmaps = false;
        this.demTex.flipY = false;
        this.demTex.needsUpdate = true;

        this.metaTex = new THREE.DataTexture(metaBytes, W, H, THREE.RGBAFormat, THREE.UnsignedByteType);
        this.metaTex.colorSpace = THREE.NoColorSpace;
        this.metaTex.minFilter = THREE.NearestFilter;
        this.metaTex.magFilter = THREE.NearestFilter;
        this.metaTex.generateMipmaps = false;
        this.metaTex.flipY = false;
        this.metaTex.needsUpdate = true;

        this.terrainMat = createTerrainMaterial(this.demTex, this.metaTex, W, H);
        this.skirtMat = createSkirtMaterial();
        this.shadowMat = createShadowMaterial(this.demTex, W, H);

        this.topMesh = new THREE.Mesh(topGeometry, this.terrainMat);
        this.skirtMesh = new THREE.Mesh(skirtGeometry, this.skirtMat);

        const shadowGeo = new THREE.PlaneGeometry(WORLD_W, worldD, 1, 1);
        shadowGeo.rotateX(-Math.PI * 0.5);
        // Flip PlaneGeometry V so v=0 is North (-Z) and v=1 is South (+Z) matching DataTexture(flipY=false)
        const suv = shadowGeo.attributes.uv;
        for (let i = 0; i < suv.count; i++) {
            suv.setY(i, 1.0 - suv.getY(i));
        }
        this.shadowMesh = new THREE.Mesh(shadowGeo, this.shadowMat);
        this.shadowMesh.position.y = -0.001;
        this.shadowMesh.renderOrder = -1;

        this.scene.add(this.shadowMesh);
        this.scene.add(this.skirtMesh);
        this.scene.add(this.topMesh);

        this.resize();
        this.applyCameraTransform();
    }

    lonLatToWorld(lon, lat) {
        const u = (lon - LON0) / (LON1 - LON0);
        const v = (LAT1 - lat) / (LAT1 - LAT0);
        const x = (u - 0.5) * WORLD_W;
        const z = (v - 0.5) * this.data.worldD;
        const elev = this.sampleElevAtUV(u, v);
        return { x, z, u, v, elev };
    }

    sampleElevAtUV(u, v) {
        const { W, H, elevM } = this.data;
        const fx = Math.max(0, Math.min(W - 1, u * (W - 1)));
        const fy = Math.max(0, Math.min(H - 1, v * (H - 1)));
        const x0 = Math.floor(fx), y0 = Math.floor(fy);
        const x1 = Math.min(W - 1, x0 + 1), y1 = Math.min(H - 1, y0 + 1);
        const tx = fx - x0, ty = fy - y0;
        const e00 = elevM[y0 * W + x0], e10 = elevM[y0 * W + x1];
        const e01 = elevM[y1 * W + x0], e11 = elevM[y1 * W + x1];
        return (e00 * (1 - tx) + e10 * tx) * (1 - ty) + (e01 * (1 - tx) + e11 * tx) * ty;
    }

    sampleSdfAtUV(u, v) {
        if (u < 0 || u > 1 || v < 0 || v > 1) return -20.0;
        const { W, H, sdfPx } = this.data;
        const fx = u * (W - 1);
        const fy = v * (H - 1);
        const x0 = Math.max(0, Math.min(W - 1, Math.floor(fx)));
        const y0 = Math.max(0, Math.min(H - 1, Math.floor(fy)));
        const x1 = Math.min(W - 1, x0 + 1);
        const y1 = Math.min(H - 1, y0 + 1);
        const tx = fx - x0, ty = fy - y0;
        const s00 = sdfPx[y0 * W + x0], s10 = sdfPx[y0 * W + x1];
        const s01 = sdfPx[y1 * W + x0], s11 = sdfPx[y1 * W + x1];
        return (s00 * (1 - tx) + s10 * tx) * (1 - ty) + (s01 * (1 - tx) + s11 * tx) * ty;
    }

    /**
     * Exact, ultra-fast heightfield + SDF ray-marching (~15 microseconds, zero BVH memory)
     * Accurately hits the 3D displaced surface at any vertical exaggeration!
     */
    raycastRelief(clientX, clientY) {
        const rect = this.canvasEl.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) return null;

        const ndcX = ((clientX - rect.left) / rect.width) * 2.0 - 1.0;
        const ndcY = -(((clientY - rect.top) / rect.height) * 2.0 - 1.0);

        const rayOrigin = this.camera.position.clone();
        const rayTarget = new THREE.Vector3(ndcX, ndcY, 0.5).unproject(this.camera);
        const rayDir = rayTarget.sub(rayOrigin).normalize();

        const maxY = 9000.0 * METER_TO_WORLD * this.currentExag + PLINTH_HEIGHT + 0.05;
        const minX = -HALF_W, maxX = HALF_W;
        const minZ = -this.data.halfD, maxZ = this.data.halfD;

        // Slab intersection against [minX..maxX] x [0..maxY] x [minZ..maxZ]
        let tMin = 0.01;
        let tMax = 60.0;
        const bounds = [
            [rayOrigin.x, rayDir.x, minX, maxX],
            [rayOrigin.y, rayDir.y, 0.0, maxY],
            [rayOrigin.z, rayDir.z, minZ, maxZ]
        ];
        for (const [o, d, b0, b1] of bounds) {
            if (Math.abs(d) < 1e-7) {
                if (o < b0 || o > b1) return null;
            } else {
                let t1 = (b0 - o) / d;
                let t2 = (b1 - o) / d;
                if (t1 > t2) { const tmp = t1; t1 = t2; t2 = tmp; }
                tMin = Math.max(tMin, t1);
                tMax = Math.min(tMax, t2);
                if (tMin > tMax) return null;
            }
        }

        const STEPS = 52;
        const dt = (tMax - tMin) / STEPS;
        let prevT = tMin;

        const evalPoint = (t) => {
            const x = rayOrigin.x + rayDir.x * t;
            const y = rayOrigin.y + rayDir.y * t;
            const z = rayOrigin.z + rayDir.z * t;
            const u = x / WORLD_W + 0.5;
            const v = z / this.data.worldD + 0.5;
            const sdf = this.sampleSdfAtUV(u, v);
            const elev = this.sampleElevAtUV(u, v);
            const surfY = elev * METER_TO_WORLD * this.currentExag + PLINTH_HEIGHT;
            return { x, y, z, u, v, sdf, elev, surfY };
        };

        for (let i = 0; i <= STEPS; i++) {
            const t = tMin + i * dt;
            const pt = evalPoint(t);
            if (pt.sdf >= -0.35 && pt.y <= pt.surfY) {
                // Binary refine intersection on [prevT, t]
                let lo = prevT, hi = t;
                for (let b = 0; b < 6; b++) {
                    const mid = 0.5 * (lo + hi);
                    const mp = evalPoint(mid);
                    if (mp.sdf >= -0.35 && mp.y <= mp.surfY) hi = mid;
                    else lo = mid;
                }
                const hit = evalPoint(hi);
                if (hit.sdf < -0.5) continue;

                const { W, H, metaBytes } = this.data;
                const ix = Math.max(0, Math.min(W - 1, Math.round(hit.u * (W - 1))));
                const iy = Math.max(0, Math.min(H - 1, Math.round(hit.v * (H - 1))));
                const mb = metaBytes[(iy * W + ix) * 4];
                const zoneId = mb & 7;
                const provId = (mb >> 3) & 7;
                const lon = LON0 + hit.u * (LON1 - LON0);
                const lat = LAT1 - hit.v * (LAT1 - LAT0);

                return {
                    x: hit.x,
                    y: hit.surfY,
                    z: hit.z,
                    u: hit.u,
                    v: hit.v,
                    lon,
                    lat,
                    elev: hit.elev,
                    zoneId,
                    provId
                };
            }
            prevT = t;
        }
        return null;
    }

    bindEvents() {
        this.onResize = () => {
            this.resize();
            this.requestFrame();
        };
        window.addEventListener('resize', this.onResize);

        // Watch light/dark theme toggle on <html data-theme="...">
        this.themeObserver = new MutationObserver(() => {
            this.syncTheme();
            this.requestFrame();
        });
        this.themeObserver.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-theme']
        });

        // Pause WebGL rendering when scrolled completely out of viewport
        if ('IntersectionObserver' in window) {
            this.io = new IntersectionObserver((entries) => {
                this.visible = entries[0]?.isIntersecting ?? true;
                if (this.visible) this.requestFrame();
            }, { threshold: 0.02 });
            this.io.observe(this.root);
        }

        const markPinchingBriefly = () => {
            this.isPinching = true;
            if (this.pinchClearTimer) clearTimeout(this.pinchClearTimer);
            this.pinchClearTimer = setTimeout(() => {
                this.isPinching = false;
            }, 140);
        };

        // Trackpad two-finger pinch (ctrlKey/metaKey) works ANYWHERE inside the 3D stage (including over pins)
        // with high finger-locked sensitivity; regular scroll wheel zooms only over Nepal's landmass.
        this.onWheel = (e) => {
            const pinBtn = e.target?.closest?.('.nr-pin');
            const pinFocus = pinBtn ? this.getPinFocusPoint(pinBtn.dataset.id) : undefined;
            const isTrackpadPinch = e.ctrlKey || e.metaKey;
            if (isTrackpadPinch) {
                e.preventDefault();
                if (this.safariGestureActive) return; // Handled smoothly via Safari gesturechange below
                markPinchingBriefly();
                const zoomFactor = Math.exp(e.deltaY * 0.0125);
                this.applyZoomStep(zoomFactor, e.clientX, e.clientY, pinFocus);
                return;
            }

            const hit = pinFocus || this.raycastRelief(e.clientX, e.clientY);
            if (!hit && !this.isDragging) return;

            e.preventDefault();
            const zoomFactor = Math.exp(e.deltaY * 0.0018);
            this.applyZoomStep(zoomFactor, e.clientX, e.clientY, hit);
        };
        this.viewportEl.addEventListener('wheel', this.onWheel, { passive: false });

        // Safari (macOS trackpad & iOS) native two-finger pinch + two-finger twist
        this.onGestureStart = (e) => {
            e.preventDefault();
            this.safariGestureActive = true;
            this.isPinching = true;
            this.gestureLastScale = e.scale || 1.0;
            this.gestureLastRotation = e.rotation || 0;
        };

        this.onGestureChange = (e) => {
            e.preventDefault();
            const curScale = Math.max(0.05, e.scale || 1.0);
            const rawStep = this.gestureLastScale / curScale;
            this.gestureLastScale = curScale;
            const factor = Math.pow(rawStep, 1.25);
            this.applyZoomStep(factor, e.clientX, e.clientY);

            if (typeof e.rotation === 'number') {
                const dRot = e.rotation - this.gestureLastRotation;
                this.gestureLastRotation = e.rotation;
                if (Math.abs(dRot) < 45) {
                    this.goalSpherical.azimuth += THREE.MathUtils.degToRad(dRot) * 0.85;
                }
            }
            this.requestFrame();
        };

        this.onGestureEnd = (e) => {
            e.preventDefault();
            this.safariGestureActive = false;
            markPinchingBriefly();
        };

        this.viewportEl.addEventListener('gesturestart', this.onGestureStart, { passive: false });
        this.viewportEl.addEventListener('gesturechange', this.onGestureChange, { passive: false });
        this.viewportEl.addEventListener('gestureend', this.onGestureEnd, { passive: false });

        // Dedicated multi-touch handler for phones/tablets:
        // - 2 fingers anywhere on stage: generous pinch-zoom toward finger midpoint + 2-finger pan + 2-finger twist
        // - 1 finger on 3D sculpture: tilt & orbit
        // - 1 finger on empty page margin: scrolls webpage naturally
        this.onTouchStart = (e) => {
            if (e.touches.length >= 2) {
                e.preventDefault();
                this.isPinching = true;
                this.touchOrbitActive = false;
                const t0 = e.touches[0];
                const t1 = e.touches[1];
                this.lastPinchDist = Math.hypot(t1.clientX - t0.clientX, t1.clientY - t0.clientY);
                this.lastPinchMid = {
                    x: (t0.clientX + t1.clientX) * 0.5,
                    y: (t0.clientY + t1.clientY) * 0.5
                };
                this.lastTouchAngle = Math.atan2(t1.clientY - t0.clientY, t1.clientX - t0.clientX);
                return;
            }

            if (e.touches.length === 1) {
                const t0 = e.touches[0];
                // Allow tapping landmark pins normally without hijacking click
                if (t0.target && t0.target.closest && t0.target.closest('.nr-pin, .nr-placard')) {
                    this.touchOrbitActive = false;
                    return;
                }
                const hit = this.raycastRelief(t0.clientX, t0.clientY);
                if (!hit) {
                    this.touchOrbitActive = false;
                    return;
                }
                this.touchOrbitActive = true;
                this.isDragging = true;
                this.pointerDownPos = { x: t0.clientX, y: t0.clientY };
                this.lastPointer = { x: t0.clientX, y: t0.clientY };
            }
        };

        this.onTouchMove = (e) => {
            if (e.touches.length >= 2) {
                e.preventDefault();
                this.isPinching = true;
                const t0 = e.touches[0];
                const t1 = e.touches[1];
                const dist = Math.hypot(t1.clientX - t0.clientX, t1.clientY - t0.clientY);
                const mid = {
                    x: (t0.clientX + t1.clientX) * 0.5,
                    y: (t0.clientY + t1.clientY) * 0.5
                };
                const angle = Math.atan2(t1.clientY - t0.clientY, t1.clientX - t0.clientX);

                if (this.lastPinchDist > 6) {
                    const rawScale = this.lastPinchDist / Math.max(6, dist);
                    const factor = Math.pow(rawScale, 1.28);
                    this.applyZoomStep(factor, mid.x, mid.y);
                }
                if (this.lastPinchMid) {
                    this.panByPixels(mid.x - this.lastPinchMid.x, mid.y - this.lastPinchMid.y);
                }
                if (this.lastTouchAngle !== null) {
                    let dAngle = angle - this.lastTouchAngle;
                    if (dAngle > Math.PI) dAngle -= Math.PI * 2;
                    if (dAngle < -Math.PI) dAngle += Math.PI * 2;
                    if (Math.abs(dAngle) < 0.5) {
                        this.goalSpherical.azimuth += dAngle * 0.85;
                    }
                }

                this.lastPinchDist = dist;
                this.lastPinchMid = mid;
                this.lastTouchAngle = angle;
                this.clearActiveTourHighlight();
                this.requestFrame();
                return;
            }

            if (e.touches.length === 1 && this.touchOrbitActive) {
                e.preventDefault();
                const t0 = e.touches[0];
                const dx = t0.clientX - this.lastPointer.x;
                const dy = t0.clientY - this.lastPointer.y;
                this.lastPointer = { x: t0.clientX, y: t0.clientY };

                this.goalSpherical.azimuth -= dx * 0.0072;
                this.goalSpherical.polar = THREE.MathUtils.clamp(
                    this.goalSpherical.polar - dy * 0.0064,
                    0.16,
                    1.32
                );
                this.clearActiveTourHighlight();
                this.requestFrame();
            }
        };

        this.onTouchEnd = (e) => {
            if (e.touches.length < 2) {
                this.lastPinchDist = 0;
                this.lastPinchMid = null;
                this.lastTouchAngle = null;
                if (this.isPinching) markPinchingBriefly();
            }
            if (e.touches.length === 0) {
                if (this.touchOrbitActive && e.changedTouches.length > 0) {
                    const t0 = e.changedTouches[0];
                    const moved = Math.hypot(t0.clientX - this.pointerDownPos.x, t0.clientY - this.pointerDownPos.y);
                    if (moved < 6) {
                        const hit = this.raycastRelief(t0.clientX, t0.clientY);
                        if (hit) this.updateTelemetry(hit);
                    }
                }
                this.touchOrbitActive = false;
                this.isDragging = false;
            } else if (e.touches.length === 1) {
                // Smoothly hand off remaining finger so lifting one finger after a pinch never jumps
                this.lastPointer = { x: e.touches[0].clientX, y: e.touches[0].clientY };
                this.touchOrbitActive = false;
            }
        };

        this.viewportEl.addEventListener('touchstart', this.onTouchStart, { passive: false });
        this.viewportEl.addEventListener('touchmove', this.onTouchMove, { passive: false });
        this.viewportEl.addEventListener('touchend', this.onTouchEnd);
        this.viewportEl.addEventListener('touchcancel', this.onTouchEnd);

        // Mouse / Stylus pointer orbit, pan & hover telemetry
        this.onPointerDown = (e) => {
            if (e.pointerType === 'touch') return;
            const hit = this.raycastRelief(e.clientX, e.clientY);
            if (!hit && e.button === 0) return;

            this.isDragging = true;
            this.dragButton = e.button;
            this.ShiftDrag = e.shiftKey;
            this.pointerDownPos = { x: e.clientX, y: e.clientY };
            this.lastPointer = { x: e.clientX, y: e.clientY };
            this.viewportEl.classList.add('nr-dragging');
            try { this.canvasEl.setPointerCapture(e.pointerId); } catch (_) {}
        };

        this.onPointerMove = (e) => {
            if (e.pointerType === 'touch') return;

            if (this.isDragging) {
                const dx = e.clientX - this.lastPointer.x;
                const dy = e.clientY - this.lastPointer.y;
                this.lastPointer = { x: e.clientX, y: e.clientY };

                if (this.dragButton === 2 || this.ShiftDrag) {
                    this.panByPixels(dx, dy);
                } else {
                    this.goalSpherical.azimuth -= dx * 0.0065;
                    this.goalSpherical.polar = THREE.MathUtils.clamp(
                        this.goalSpherical.polar - dy * 0.0058,
                        0.16, // nearly straight overhead map
                        1.32  // low dramatic horizon angle
                    );
                }
                this.clearActiveTourHighlight();
                this.requestFrame();
                return;
            }

            // Live hover elevation & physiographic belt telemetry
            const hit = this.raycastRelief(e.clientX, e.clientY);
            if (hit) {
                this.viewportEl.classList.add('nr-hovering-model');
                this.terrainMat.uniforms.uHoverUV.value.set(hit.u, hit.v);
                this.updateTelemetry(hit);
                this.requestFrame();
            } else if (this.terrainMat.uniforms.uHoverUV.value.x >= 0) {
                this.viewportEl.classList.remove('nr-hovering-model');
                this.terrainMat.uniforms.uHoverUV.value.set(-1, -1);
                this.updateTelemetry(null);
                this.requestFrame();
            }
        };

        this.onPointerUp = (e) => {
            if (e.pointerType === 'touch') return;

            if (this.isDragging) {
                const moved = Math.hypot(e.clientX - this.pointerDownPos.x, e.clientY - this.pointerDownPos.y);
                this.isDragging = false;
                this.viewportEl.classList.remove('nr-dragging');

                if (moved < 4) {
                    const hit = this.raycastRelief(e.clientX, e.clientY);
                    if (hit) this.updateTelemetry(hit);
                }
            }
        };

        this.onDoubleClick = (e) => {
            const hit = this.raycastRelief(e.clientX, e.clientY);
            if (!hit) return;
            this.goalTarget.set(hit.x, hit.y * 0.72, hit.z);
            this.goalSpherical.radius = Math.max(MIN_ZOOM_RADIUS, this.goalSpherical.radius * 0.56);
            this.clearActiveTourHighlight();
            this.requestFrame();
        };

        this.canvasEl.addEventListener('pointerdown', this.onPointerDown);
        window.addEventListener('pointermove', this.onPointerMove);
        window.addEventListener('pointerup', this.onPointerUp);
        this.viewportEl.addEventListener('dblclick', this.onDoubleClick);
        this.viewportEl.addEventListener('contextmenu', (e) => e.preventDefault());

        // UI Control Buttons
        this.root.querySelectorAll('[data-mode]').forEach(btn => {
            btn.addEventListener('click', () => {
                this.mode = parseInt(btn.dataset.mode, 10);
                this.focusId = 0;
                this.terrainMat.uniforms.uMode.value = this.mode;
                this.terrainMat.uniforms.uFocusId.value = 0;
                this.root.querySelectorAll('[data-mode]').forEach(b => b.classList.toggle('nr-active', b === btn));
                this.updateLegendStrip();
                this.requestFrame();
            });
        });

        this.root.querySelectorAll('[data-exag]').forEach(btn => {
            btn.addEventListener('click', () => {
                this.targetExag = parseFloat(btn.dataset.exag);
                this.root.querySelectorAll('[data-exag]').forEach(b => b.classList.toggle('nr-active', b === btn));
                this.requestFrame();
            });
        });

        this.root.querySelectorAll('[data-tour]').forEach(btn => {
            btn.addEventListener('click', () => {
                const stop = TOUR_STOPS.find(s => s.id === btn.dataset.tour);
                if (!stop) return;
                this.flyToTour(stop);
            });
        });

        this.root.querySelectorAll('[data-action]').forEach(btn => {
            btn.addEventListener('click', () => {
                const act = btn.dataset.action;
                if (act === 'zoom-in') {
                    this.goalSpherical.radius = Math.max(MIN_ZOOM_RADIUS, this.goalSpherical.radius * 0.68);
                    this.clearActiveTourHighlight();
                } else if (act === 'zoom-out') {
                    this.applyZoomStep(1.38);
                } else if (act === 'labels') {
                    this.showLabels = !this.showLabels;
                    btn.setAttribute('aria-pressed', String(this.showLabels));
                } else if (act === 'reset') {
                    this.selectedLandmark = null;
                    this.targetMeridian = 0.0;
                    this.placardEl.classList.add('nr-hidden');
                    this.flyToTour(TOUR_STOPS[0]);
                }
                this.requestFrame();
            });
        });

        this.root.querySelector('#nr-placard-close').addEventListener('click', () => {
            this.selectedLandmark = null;
            this.targetMeridian = 0.0;
            this.placardEl.classList.add('nr-hidden');
            this.pinItems.forEach(p => p.el.classList.remove('nr-pin-active'));
            this.requestFrame();
        });
    }

    getPinFocusPoint(landmarkId) {
        if (!landmarkId) return undefined;
        const item = this.pinItems.find(p => p.lm.id === landmarkId);
        if (!item) return undefined;
        return {
            x: item.wx,
            y: item.elev * METER_TO_WORLD * this.currentExag + PLINTH_HEIGHT,
            z: item.wz
        };
    }

    /**
     * Snap any (x, z) point that falls outside Nepal's clipped border smoothly inward
     * onto the nearest sculpted terrain inside Nepal so deep zoom never flies into empty air.
     */
    clampWorldPointInsideNepal(wx, wz, minSdfPx = 7.0) {
        let u = THREE.MathUtils.clamp(wx / WORLD_W + 0.5, 0.02, 0.98);
        let v = THREE.MathUtils.clamp(wz / this.data.worldD + 0.5, 0.02, 0.98);
        const du = 2.5 / this.data.W;
        const dv = 2.5 / this.data.H;

        for (let iter = 0; iter < 10; iter++) {
            const s = this.sampleSdfAtUV(u, v);
            if (s >= minSdfPx) break;
            const gx = this.sampleSdfAtUV(Math.min(0.99, u + du), v) - this.sampleSdfAtUV(Math.max(0.01, u - du), v);
            const gz = this.sampleSdfAtUV(u, Math.min(0.99, v + dv)) - this.sampleSdfAtUV(u, Math.max(0.01, v - dv));
            const len = Math.hypot(gx, gz);
            if (len < 1e-4) {
                u = THREE.MathUtils.lerp(u, 0.54, 0.25);
                v = THREE.MathUtils.lerp(v, 0.54, 0.25);
            } else {
                const stepPx = Math.min(18.0, (minSdfPx + 0.4 - s) * 1.25);
                u = THREE.MathUtils.clamp(u + (gx / len) * (stepPx / this.data.W), 0.02, 0.98);
                v = THREE.MathUtils.clamp(v + (gz / len) * (stepPx / this.data.H), 0.02, 0.98);
            }
        }

        const elev = this.sampleElevAtUV(u, v);
        return {
            x: (u - 0.5) * WORLD_W,
            y: elev * METER_TO_WORLD * this.currentExag + PLINTH_HEIGHT,
            z: (v - 0.5) * this.data.worldD
        };
    }

    /**
     * Unified pinch / wheel zoom step:
     * - Zooms deeply in (down to MIN_ZOOM_RADIUS = 0.62) anchored toward the cursor / two-finger midpoint
     * - Guarantees the focal target always stays inside Nepal's 3D landmass (never empty clipped space)
     * - Smoothly re-centers Nepal onto the page when pinching all the way back out
     */
    applyZoomStep(factor, clientX, clientY, precomputedHit = undefined) {
        if (!Number.isFinite(factor) || factor <= 0) return;
        const prevR = this.goalSpherical.radius;
        const nextR = THREE.MathUtils.clamp(prevR * factor, MIN_ZOOM_RADIUS, MAX_ZOOM_RADIUS);
        this.goalSpherical.radius = nextR;

        if (nextR < prevR && typeof clientX === 'number' && typeof clientY === 'number') {
            let focus = precomputedHit !== undefined ? precomputedHit : this.raycastRelief(clientX, clientY);

            if (!focus) {
                const elAtPoint = document.elementFromPoint(clientX, clientY);
                const pinBtn = elAtPoint?.closest?.('.nr-pin');
                if (pinBtn) {
                    focus = this.getPinFocusPoint(pinBtn.dataset.id);
                }
            }

            // Fallback to plinth ground plane clamped inside Nepal if fingers pinch near border/sky
            if (!focus) {
                const rect = this.canvasEl.getBoundingClientRect();
                if (rect.width > 0 && rect.height > 0) {
                    const ndcX = ((clientX - rect.left) / rect.width) * 2.0 - 1.0;
                    const ndcY = -(((clientY - rect.top) / rect.height) * 2.0 - 1.0);
                    const ro = this.camera.position.clone();
                    const rd = new THREE.Vector3(ndcX, ndcY, 0.5).unproject(this.camera).sub(ro).normalize();
                    if (Math.abs(rd.y) > 1e-4) {
                        const t = (PLINTH_HEIGHT - ro.y) / rd.y;
                        if (t > 0 && t < 50) {
                            focus = this.clampWorldPointInsideNepal(ro.x + rd.x * t, ro.z + rd.z * t);
                        }
                    }
                }
            } else {
                const safe = this.clampWorldPointInsideNepal(focus.x, focus.z);
                focus = { x: safe.x, y: Math.max(focus.y, safe.y), z: safe.z };
            }

            if (focus) {
                const pull = Math.min(0.42, (1.0 - nextR / prevR) * 1.15);
                const nx = THREE.MathUtils.lerp(this.goalTarget.x, focus.x, pull);
                const nz = THREE.MathUtils.lerp(this.goalTarget.z, focus.z, pull);
                const clampedGoal = this.clampWorldPointInsideNepal(nx, nz);
                this.goalTarget.x = clampedGoal.x;
                this.goalTarget.z = clampedGoal.z;
                this.goalTarget.y = THREE.MathUtils.lerp(this.goalTarget.y, focus.y * 0.72, pull);
            }
        } else if (nextR > prevR && nextR > 6.0) {
            // Smoothly re-center the sculpture onto the page as the user pinches back out to full view
            const overviewR = this.computeOverviewRadius();
            const recenterT = THREE.MathUtils.clamp((nextR - prevR) / Math.max(0.6, overviewR - prevR + 0.6), 0.0, 0.55);
            this.goalTarget.x = THREE.MathUtils.lerp(this.goalTarget.x, 0.44, recenterT);
            this.goalTarget.y = THREE.MathUtils.lerp(this.goalTarget.y, 0.14, recenterT);
            this.goalTarget.z = THREE.MathUtils.lerp(this.goalTarget.z, 0.22, recenterT);
        }

        this.clearActiveTourHighlight();
        this.requestFrame();
    }

    panByPixels(dx, dy) {
        const panScale = this.goalSpherical.radius * 0.00145;
        const cosA = Math.cos(this.spherical.azimuth);
        const sinA = Math.sin(this.spherical.azimuth);
        // Camera right = (cosA, 0, -sinA), Camera forward on ground = (-sinA, 0, -cosA)
        this.goalTarget.x = THREE.MathUtils.clamp(
            this.goalTarget.x - (dx * cosA + dy * sinA) * panScale,
            -HALF_W * 0.92,
            HALF_W * 0.92
        );
        this.goalTarget.z = THREE.MathUtils.clamp(
            this.goalTarget.z - (-dx * sinA + dy * cosA) * panScale,
            -this.data.halfD * 0.92,
            this.data.halfD * 0.92
        );
    }

    computeOverviewRadius() {
        const halfFovRad = THREE.MathUtils.degToRad(this.camera.fov * 0.5);
        const halfWidthNeeded = 6.12; // Full NW->SE diagonal + perspective margin on both ends
        const rFitWidth = halfWidthNeeded / Math.max(0.25, Math.tan(halfFovRad) * this.camera.aspect);
        return THREE.MathUtils.clamp(rFitWidth, 9.8, 14.2);
    }

    flyToTour(stop) {
        this.activeTourId = stop.id;
        this.root.querySelectorAll('[data-tour]').forEach(b => {
            b.classList.toggle('nr-active', b.dataset.tour === stop.id);
        });

        const { x, z, elev } = this.lonLatToWorld(stop.lon, stop.lat);
        const wy = elev * METER_TO_WORLD * this.targetExag + PLINTH_HEIGHT;
        this.goalTarget.set(x, wy * 0.55, z);
        this.goalSpherical.radius = stop.radius ?? this.computeOverviewRadius();
        this.goalSpherical.polar = stop.polar;
        this.goalSpherical.azimuth = stop.azimuth;

        if (stop.landmarkId) {
            const lm = LANDMARKS.find(l => l.id === stop.landmarkId);
            if (lm) this.showPlacard(lm);
        } else {
            this.selectedLandmark = null;
            this.targetMeridian = 0.0;
            this.placardEl.classList.add('nr-hidden');
            this.pinItems.forEach(p => p.el.classList.remove('nr-pin-active'));
        }
        this.requestFrame();
    }

    focusLandmark(lm) {
        const { x, z, elev } = this.lonLatToWorld(lm.lon, lm.lat);
        const wy = Math.max(elev, lm.elev * 0.9) * METER_TO_WORLD * this.targetExag + PLINTH_HEIGHT;
        this.goalTarget.set(x, wy * 0.65, z);
        this.goalSpherical.radius = Math.min(this.goalSpherical.radius, lm.kind === 'peak' ? 2.45 : 2.25);
        this.goalSpherical.polar = Math.max(this.goalSpherical.polar, 0.96);
        this.clearActiveTourHighlight();
        this.showPlacard(lm);
        this.requestFrame();
    }

    showPlacard(lm) {
        this.selectedLandmark = lm;
        this.targetMeridian = lm.meridian ? 1.0 : 0.0;
        this.pinItems.forEach(p => p.el.classList.toggle('nr-pin-active', p.lm.id === lm.id));

        const ft = Math.round(lm.elev * 3.28084).toLocaleString();
        this.root.querySelector('#nr-placard-name').textContent = lm.name;
        this.root.querySelector('#nr-placard-nep').textContent = lm.nep;
        this.root.querySelector('#nr-placard-meta').textContent =
            `${lm.elev.toLocaleString()} m (${ft} ft) · ${lm.lat.toFixed(2)}°N, ${lm.lon.toFixed(2)}°E`;
        this.root.querySelector('#nr-placard-desc').textContent = lm.desc;
        this.placardEl.classList.remove('nr-hidden');
    }

    clearActiveTourHighlight() {
        this.activeTourId = null;
        this.root.querySelectorAll('[data-tour]').forEach(b => b.classList.remove('nr-active'));
    }

    updateLegendStrip() {
        if (this.mode === 1) {
            const items = [
                { id: 1, label: 'Terai Plains · 17% (60–600 m)', color: '#2f9e66' },
                { id: 2, label: 'Pahad / Hills & Chure · 68% (600–3,000 m)', color: '#d4843b' },
                { id: 3, label: 'Himal · 15% (3,000–8,849 m)', color: '#4b86e8' }
            ];
            this.renderLegendChips(items);
            this.legendEl.classList.remove('nr-hidden');
        } else if (this.mode === 2) {
            const order = [7, 6, 5, 4, 3, 2, 1]; // West -> East geographic order!
            const items = order.map(id => ({
                id,
                label: `${PROV_META[id].name} (${PROV_META[id].nep})`,
                color: PROV_META[id].color
            }));
            this.renderLegendChips(items);
            this.legendEl.classList.remove('nr-hidden');
        } else {
            this.legendEl.classList.add('nr-hidden');
            this.legendEl.innerHTML = '';
        }
    }

    renderLegendChips(items) {
        this.legendEl.innerHTML = items.map(item => `
            <button type="button" class="nr-legend-chip" data-focus="${item.id}">
                <span class="nr-dot" style="background:${item.color}"></span>
                <span>${item.label}</span>
            </button>
        `).join('');

        this.legendEl.querySelectorAll('[data-focus]').forEach(chip => {
            chip.addEventListener('click', () => {
                const id = parseInt(chip.dataset.focus, 10);
                this.focusId = this.focusId === id ? 0 : id;
                this.terrainMat.uniforms.uFocusId.value = this.focusId;
                this.legendEl.querySelectorAll('[data-focus]').forEach(c => {
                    const cid = parseInt(c.dataset.focus, 10);
                    c.classList.toggle('nr-focused', this.focusId === cid);
                    c.classList.toggle('nr-dimmed', this.focusId !== 0 && this.focusId !== cid);
                });
                this.requestFrame();
            });
        });
    }

    updateTelemetry(hit) {
        if (!hit) {
            this.readoutEl.innerHTML = `
                <strong>60 m → 8,848.86 m</strong>
                <span class="nr-readout-sep">·</span>
                <span>Pinch to zoom in &amp; out · Drag sculpture to tilt &amp; orbit</span>
            `;
            return;
        }
        const m = Math.round(hit.elev);
        const ft = Math.round(hit.elev * 3.28084);
        const zInfo = ZONE_META[hit.zoneId] || ZONE_META[3];
        const pInfo = PROV_META[hit.provId];
        const provText = pInfo ? `<span class="nr-readout-sep">·</span><span>${pInfo.name}</span>` : '';

        this.readoutEl.innerHTML = `
            <strong>${m.toLocaleString()} m</strong>
            <span>(${ft.toLocaleString()} ft)</span>
            <span class="nr-readout-sep">·</span>
            <span>${hit.lat.toFixed(2)}°N, ${hit.lon.toFixed(2)}°E</span>
            <span class="nr-readout-badge">
                <span class="nr-dot" style="background:${zInfo.color}"></span>
                ${zInfo.name}
            </span>
            ${provText}
        `;
    }

    syncTheme() {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark' ? 1.0 : 0.0;
        this.terrainMat.uniforms.uDarkTheme.value = isDark;
        this.skirtMat.uniforms.uDarkTheme.value = isDark;
        this.shadowMat.uniforms.uDarkTheme.value = isDark;
    }

    resize() {
        const rect = this.viewportEl.getBoundingClientRect();
        const w = Math.max(260, Math.floor(rect.width));
        const h = Math.max(220, Math.floor(rect.height));
        this.viewW = w;
        this.viewH = h;
        this.camera.aspect = w / h;
        this.camera.fov = w < 520 ? 41 : 33;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(w, h, false);

        if (this.activeTourId === 'overview') {
            const r = this.computeOverviewRadius();
            this.goalSpherical.radius = r;
            if (!this._hasSizedOnce) {
                this.spherical.radius = r;
                this._hasSizedOnce = true;
            }
        }
    }

    applyCameraTransform() {
        const { radius, polar, azimuth } = this.spherical;
        const sinP = Math.sin(polar);
        const cosP = Math.cos(polar);
        const sinA = Math.sin(azimuth);
        const cosA = Math.cos(azimuth);

        this.camera.position.set(
            this.target.x + radius * sinP * sinA,
            this.target.y + radius * cosP,
            this.target.z + radius * sinP * cosA
        );
        this.camera.lookAt(this.target);
        this.camera.updateMatrixWorld();

        if (this.compassEl) {
            const deg = THREE.MathUtils.radToDeg(azimuth);
            this.compassEl.style.transform = `rotate(${deg.toFixed(1)}deg)`;
        }
    }

    updateProjectedPins() {
        const w = this.viewW || 800;
        const h = this.viewH || 420;
        const zoomedIn = this.spherical.radius < 4.7;
        const placedBoxes = [];

        // Prioritize selected landmark first, then Tier 1, then Tier 2 by elevation
        const ordered = [...this.pinItems].sort((a, b) => {
            const aSel = this.selectedLandmark?.id === a.lm.id ? 1 : 0;
            const bSel = this.selectedLandmark?.id === b.lm.id ? 1 : 0;
            if (aSel !== bSel) return bSel - aSel;
            if (a.lm.tier !== b.lm.tier) return a.lm.tier - b.lm.tier;
            return b.lm.elev - a.lm.elev;
        });

        const vProj = new THREE.Vector3();
        for (const item of ordered) {
            const isSel = this.selectedLandmark?.id === item.lm.id;
            if (!this.showLabels && !isSel) {
                item.el.classList.add('nr-pin-hidden');
                continue;
            }
            if (item.lm.tier > 1 && !zoomedIn && !isSel) {
                item.el.classList.add('nr-pin-hidden');
                continue;
            }

            const wy = item.elev * METER_TO_WORLD * this.currentExag + PLINTH_HEIGHT;
            vProj.set(item.wx, wy, item.wz).project(this.camera);

            if (vProj.z < -1 || vProj.z > 1) {
                item.el.classList.add('nr-pin-hidden');
                continue;
            }

            const sx = (vProj.x * 0.5 + 0.5) * w;
            const sy = (-vProj.y * 0.5 + 0.5) * h;

            if (sx < 24 || sx > w - 24 || sy < 22 || sy > h - 10) {
                item.el.classList.add('nr-pin-hidden');
                continue;
            }

            // Screen-space collision decluttering so labels never pile on top of each other
            const charScale = w < 600 ? 3.1 : 3.5;
            const elevPad = w < 600 ? 10 : 28;
            const halfTagW = Math.max(42, item.lm.short.length * charScale + elevPad);
            const tagH = 23;
            const box = { x0: sx - halfTagW, x1: sx + halfTagW, y0: sy - 34, y1: sy - 34 + tagH };

            let overlaps = false;
            if (!isSel) {
                for (const b of placedBoxes) {
                    if (box.x0 < b.x1 && box.x1 > b.x0 && box.y0 < b.y1 && box.y1 > b.y0) {
                        overlaps = true;
                        break;
                    }
                }
            }

            if (overlaps) {
                item.el.classList.add('nr-pin-hidden');
                continue;
            }

            placedBoxes.push(box);
            item.el.classList.remove('nr-pin-hidden');
            item.el.style.transform = `translate3d(${sx.toFixed(1)}px, ${sy.toFixed(1)}px, 0) translate(-50%, -100%)`;
        }
    }

    requestFrame() {
        if (this.disposed || this.rafId !== null || !this.visible) return;
        this.rafId = window.requestAnimationFrame(() => this.tick());
    }

    tick() {
        this.rafId = null;
        if (this.disposed || !this.visible) return;

        // Instant finger-locked response during active pinch/drag; silky cinematic glide for tour flights
        const camDamp = this.isPinching ? 0.45 : (this.isDragging ? 0.30 : 0.14);
        const fxDamp = 0.14;
        let moving = false;

        const stepScalar = (cur, goal, damp, eps = 1e-4) => {
            const diff = goal - cur;
            if (Math.abs(diff) > eps) {
                moving = true;
                return cur + diff * damp;
            }
            return goal;
        };

        this.spherical.radius = stepScalar(this.spherical.radius, this.goalSpherical.radius, camDamp, 4e-4);
        this.spherical.polar = stepScalar(this.spherical.polar, this.goalSpherical.polar, camDamp, 3e-4);
        this.spherical.azimuth = stepScalar(this.spherical.azimuth, this.goalSpherical.azimuth, camDamp, 3e-4);

        this.target.x = stepScalar(this.target.x, this.goalTarget.x, camDamp, 3e-4);
        this.target.y = stepScalar(this.target.y, this.goalTarget.y, camDamp, 3e-4);
        this.target.z = stepScalar(this.target.z, this.goalTarget.z, camDamp, 3e-4);

        this.currentExag = stepScalar(this.currentExag, this.targetExag, fxDamp, 2e-3);
        this.currentMeridian = stepScalar(this.currentMeridian, this.targetMeridian, fxDamp, 3e-3);

        this.terrainMat.uniforms.uExaggeration.value = this.currentExag;
        this.terrainMat.uniforms.uShowMeridian.value = this.currentMeridian;
        this.skirtMat.uniforms.uExaggeration.value = this.currentExag;
        this.shadowMat.uniforms.uExaggeration.value = this.currentExag;

        this.applyCameraTransform();
        this.renderer.render(this.scene, this.camera);
        this.updateProjectedPins();

        if (moving) {
            this.requestFrame();
        }
    }

    dispose() {
        if (this.disposed) return;
        this.disposed = true;
        if (this.rafId !== null) window.cancelAnimationFrame(this.rafId);
        if (this.pinchClearTimer) clearTimeout(this.pinchClearTimer);
        window.removeEventListener('resize', this.onResize);
        window.removeEventListener('pointermove', this.onPointerMove);
        window.removeEventListener('pointerup', this.onPointerUp);
        if (this.themeObserver) this.themeObserver.disconnect();
        if (this.io) this.io.disconnect();

        this.demTex?.dispose();
        this.metaTex?.dispose();
        this.terrainMat?.dispose();
        this.skirtMat?.dispose();
        this.shadowMat?.dispose();
        this.shadowMesh?.geometry?.dispose();
        this.renderer?.dispose();
    }
}

let activeInstance = null;

async function syncMount() {
    const mountEl = document.getElementById('nepal-relief-root');

    if (!mountEl) {
        if (activeInstance) {
            activeInstance.dispose();
            activeInstance = null;
        }
        return;
    }

    if (activeInstance && activeInstance.root === mountEl) return;

    if (activeInstance) {
        activeInstance.dispose();
        activeInstance = null;
    }

    mountEl.innerHTML = `
        <div class="nr-viewport">
            <div class="nr-loading">
                <div class="nr-loading-pulse"></div>
                <span>Carving 3D topographical relief of Nepal…</span>
            </div>
        </div>
    `;

    try {
        const dataset = await loadReliefDataset();
        // Verify mountEl is still attached in case user clicked away during initial fetch
        if (!document.body.contains(mountEl)) return;
        activeInstance = new NepalReliefInstance(mountEl, dataset);
    } catch (err) {
        console.error('Nepal 3D Relief failed to initialize:', err);
        mountEl.innerHTML = `<p style="color:var(--text-muted); font-size:0.875rem;">Unable to initialize WebGL 3D relief viewer on this device.</p>`;
    }
}

function initReliefObserver() {
    const contentContainer = document.getElementById('main-content-inner');
    if (contentContainer) {
        const obs = new MutationObserver(() => syncMount());
        obs.observe(contentContainer, { childList: true });
    }
    syncMount();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initReliefObserver);
} else {
    initReliefObserver();
}

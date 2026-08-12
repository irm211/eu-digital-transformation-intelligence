const EUROSTAT_URL =
    "https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/isoc_eb_ai" +
    "?format=JSON" +
    "&sinceTimePeriod=2021" +
    "&geo=EU27_2020" +
    "&geo=BE&geo=BG&geo=CZ&geo=DK&geo=DE&geo=EE&geo=IE&geo=EL&geo=ES" +
    "&geo=FR&geo=HR&geo=IT&geo=CY&geo=LV&geo=LT&geo=LU&geo=HU&geo=MT" +
    "&geo=NL&geo=AT&geo=PL&geo=PT&geo=RO&geo=SI&geo=SK&geo=FI&geo=SE" +
    "&unit=PC_ENT" +
    "&size_emp=GE10" +
    "&nace_r2=C10-S951_X_K" +
    "&indic_is=E_AI_TANY" +
    "&lang=EN";

const GEO_NAMES = {
    EU27_2020: "European Union - 27 countries (from 2020)",
    BE: "Belgium",
    BG: "Bulgaria",
    CZ: "Czechia",
    DK: "Denmark",
    DE: "Germany",
    EE: "Estonia",
    IE: "Ireland",
    EL: "Greece",
    ES: "Spain",
    FR: "France",
    HR: "Croatia",
    IT: "Italy",
    CY: "Cyprus",
    LV: "Latvia",
    LT: "Lithuania",
    LU: "Luxembourg",
    HU: "Hungary",
    MT: "Malta",
    NL: "Netherlands",
    AT: "Austria",
    PL: "Poland",
    PT: "Portugal",
    RO: "Romania",
    SI: "Slovenia",
    SK: "Slovakia",
    FI: "Finland",
    SE: "Sweden"
};

async function loadEurostatData() {
    const response = await fetch(EUROSTAT_URL);

    if (!response.ok) {
        throw new Error(
            `Eurostat request failed: ${response.status}`
        );
    }

    const data = await response.json();

    const dimensions = data.id;
    const sizes = data.size;

    const geoIndex = data.dimension.geo.category.index;
    const timeIndex = data.dimension.time.category.index;

    const observations = [];

    /*
        Eurostat stores observations in a flattened
        multidimensional array.

        We reconstruct the country/year combination
        from the dimension indexes.
    */

    const geos = Object.entries(geoIndex)
        .sort((a, b) => a[1] - b[1])
        .map(([code]) => code);

    const years = Object.entries(timeIndex)
        .sort((a, b) => a[1] - b[1])
        .map(([year]) => year);

    /*
        For this query, the dimensions are:

        freq
        size_emp
        nace_r2
        indic_is
        unit
        geo
        time

        The first five dimensions each contain
        exactly one selected category.

        Therefore geo/time determine the observation.
    */

    const geoSize = sizes[5];
    const timeSize = sizes[6];

    for (const geo of geos) {

        const geoPosition = geoIndex[geo];

        for (const year of years) {

            const timePosition = timeIndex[year];

            const observationIndex =
                geoPosition * timeSize +
                timePosition;

            const value = data.value?.[observationIndex];

            observations.push({
                countryCode: geo,
                country: GEO_NAMES[geo] || geo,
                year: Number(year),
                adoption: value ?? null
            });
        }
    }

    return observations;
}

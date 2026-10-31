export type Country = { iso: string; name: string; dial: string };

const RAW =
  "AF Afghanistan 93;AL Albania 355;DZ Algeria 213;AD Andorra 376;AO Angola 244;AR Argentina 54;AM Armenia 374;AU Australia 61;AT Austria 43;AZ Azerbaijan 994;BH Bahrain 973;BD Bangladesh 880;BY Belarus 375;BE Belgium 32;BZ Belize 501;BJ Benin 229;BT Bhutan 975;BO Bolivia 591;BA Bosnia_and_Herzegovina 387;BW Botswana 267;BR Brazil 55;BN Brunei 673;BG Bulgaria 359;BF Burkina_Faso 226;BI Burundi 257;KH Cambodia 855;CM Cameroon 237;CA Canada 1;CL Chile 56;CN China 86;CO Colombia 57;CR Costa_Rica 506;HR Croatia 385;CU Cuba 53;CY Cyprus 357;CZ Czechia 420;DK Denmark 45;DJ Djibouti 253;DO Dominican_Republic 1;EC Ecuador 593;EG Egypt 20;SV El_Salvador 503;EE Estonia 372;ET Ethiopia 251;FJ Fiji 679;FI Finland 358;FR France 33;GA Gabon 241;GE Georgia 995;DE Germany 49;GH Ghana 233;GR Greece 30;GT Guatemala 502;HN Honduras 504;HK Hong_Kong 852;HU Hungary 36;IS Iceland 354;IN India 91;ID Indonesia 62;IR Iran 98;IQ Iraq 964;IE Ireland 353;IL Israel 972;IT Italy 39;CI Ivory_Coast 225;JM Jamaica 1;JP Japan 81;JO Jordan 962;KZ Kazakhstan 7;KE Kenya 254;KW Kuwait 965;KG Kyrgyzstan 996;LA Laos 856;LV Latvia 371;LB Lebanon 961;LY Libya 218;LT Lithuania 370;LU Luxembourg 352;MO Macau 853;MG Madagascar 261;MW Malawi 265;MY Malaysia 60;MV Maldives 960;ML Mali 223;MT Malta 356;MU Mauritius 230;MX Mexico 52;MD Moldova 373;MC Monaco 377;MN Mongolia 976;ME Montenegro 382;MA Morocco 212;MZ Mozambique 258;MM Myanmar 95;NA Namibia 264;NP Nepal 977;NL Netherlands 31;NZ New_Zealand 64;NI Nicaragua 505;NE Niger 227;NG Nigeria 234;MK North_Macedonia 389;NO Norway 47;OM Oman 968;PK Pakistan 92;PS Palestine 970;PA Panama 507;PG Papua_New_Guinea 675;PY Paraguay 595;PE Peru 51;PH Philippines 63;PL Poland 48;PT Portugal 351;PR Puerto_Rico 1;QA Qatar 974;RO Romania 40;RU Russia 7;RW Rwanda 250;SA Saudi_Arabia 966;SN Senegal 221;RS Serbia 381;SC Seychelles 248;SL Sierra_Leone 232;SG Singapore 65;SK Slovakia 421;SI Slovenia 386;SO Somalia 252;ZA South_Africa 27;KR South_Korea 82;SS South_Sudan 211;ES Spain 34;LK Sri_Lanka 94;SD Sudan 249;SE Sweden 46;CH Switzerland 41;SY Syria 963;TW Taiwan 886;TJ Tajikistan 992;TZ Tanzania 255;TH Thailand 66;TG Togo 228;TT Trinidad_and_Tobago 1;TN Tunisia 216;TR Turkey 90;TM Turkmenistan 993;UG Uganda 256;UA Ukraine 380;AE United_Arab_Emirates 971;GB United_Kingdom 44;US United_States 1;UY Uruguay 598;UZ Uzbekistan 998;VE Venezuela 58;VN Vietnam 84;YE Yemen 967;ZM Zambia 260;ZW Zimbabwe 263";

export const COUNTRIES: Country[] = RAW.split(";").map((s) => {
  const [iso = "", name = "", dial = ""] = s.split(" ");
  return { iso, name: name.replace(/_/g, " "), dial };
});

export function flag(iso: string) {
  return String.fromCodePoint(...[...iso].map((c) => 0x1f1a5 + c.charCodeAt(0)));
}

/** Guess the visitor's country from browser language, e.g. en-IN → IN. Falls back to IN. */
export function guessCountry(): Country {
  const langs = typeof navigator !== "undefined" ? navigator.languages ?? [navigator.language] : [];
  for (const l of langs) {
    const region = l.split("-")[1]?.toUpperCase();
    const hit = region && COUNTRIES.find((c) => c.iso === region);
    if (hit) return hit;
  }
  return COUNTRIES.find((c) => c.iso === "IN")!;
}

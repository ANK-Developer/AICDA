import { withPageMeta } from "@/components/common/withPageMeta";
import { PageShell } from "@/components/site/PageShell";
import { Prose } from "@/components/site/ContentBlocks";

const PAGE_META = [
  { title: "Authorized Dealers · AICDA" },
  { name: "description", content: "AICDA-verified authorized dealers for every major brand." },
  { property: "og:title", content: "Authorized Dealers · AICDA" },
  {
    property: "og:description",
    content: "AICDA-verified authorized dealers for every major brand.",
  },
];

function Page() {
  return (
    <PageShell
      title="Authorized Dealers"
      subtitle="AICDA-verified authorized dealers for every major brand."
    >
      <Prose>
        <h2>About Authorized Dealers</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-150 border-collapse text-[18px] text-gray-700">
            <tbody>
              <tr>
                <td colSpan={2} className="text-xl font-semibold py-2 border-0">
                  Maruti Authorised Dealers
                </td>
              </tr>

              <tr>
                <td className="border border-gray-400 px-2 py-2 w-80">AALIANZ AUTOMOBILES</td>
                <td className="border border-gray-400 px-2 py-2">
                  KAMAL CINEMA BUILDING
                  <br />
                  SAFDARJUNG ENCLAVE
                  <br />
                  Ph. No. 011-26104693, 26183785
                  <br />
                  Email: aalianz@satyam.net.in
                </td>
              </tr>

              <tr>
                <td className="border border-gray-400 px-2 py-2 w-80">
                  APRA AUTO (INDIA) PVT. LTD.
                </td>
                <td className="border border-gray-400 px-2 py-2">
                  K-804/2, MAHIPALPUR
                  <br />
                  VASANT KUNJ ROAD
                  <br />
                  Ph. No. 011-42390000, 41009900
                  <br />
                  Fax: 52390088
                  <br />
                  Email: apravk@apraauto.net
                </td>
              </tr>

              <tr>
                <td className="border border-gray-400 px-2 py-2 w-80">BAGGA LINK MOTORS (P) LTD</td>
                <td className="border border-gray-400 px-2 py-2">
                  395, PATPARGANJ INDL. AREA
                  <br />
                  Ph. No. 011-22169111, 22169555, 22169222
                  <br />
                  Fax: 22141133
                  <br />
                  Email: blm@del2.vsnl.net.in
                </td>
              </tr>

              <tr>
                <td className="border border-gray-400 px-2 py-2 w-80">
                  COMPETENT AUTOMOBILES CO LTD
                </td>
                <td className="border border-gray-400 px-2 py-2">
                  48 RING ROAD, LAJPAT NAGAR IV
                  <br />
                  Ph. No. 011-26917814
                  <br />
                  Fax: 26830306
                  <br />
                  Email: cacllp@mantraonline.com
                </td>
              </tr>

              <tr>
                <td className="border border-gray-400 px-2 py-2 w-80">
                  COMPETENT AUTOMOBILES CO LTD
                </td>
                <td className="border border-gray-400 px-2 py-2">
                  F-14, COMPETENT HOUSE, MIDDLE CIRCLE
                  <br />
                  CONNAUGHT PLACE
                  <br />
                  Ph. No. 011-23355285, 86, 87, 23354572, 73, 74, 23328009
                  <br />
                  Fax: 23327640
                  <br />
                  Email: competent@del6.vsnl.net.in
                </td>
              </tr>

              <tr>
                <td className="border border-gray-400 px-2 py-2 w-80">
                  COMPETENT AUTOMOBILES CO LTD
                </td>
                <td className="border border-gray-400 px-2 py-2">
                  19 SHIVAJI MARG
                  <br />
                  Ph. No. 011-25925261, 25925329, 25930611
                  <br />
                  Email: competent@del6.vsnl.net.in
                </td>
              </tr>

              <tr>
                <td className="border border-gray-400 px-2 py-2 w-80">
                  COMPETENT AUTOMOBILES CO LTD
                </td>
                <td className="border border-gray-400 px-2 py-2">
                  3 GAZIPUR, DELHI (EAST)
                  <br />
                  Ph. No. 011-22446551, 22217774, 22446552
                  <br />
                  Fax: 22446553
                  <br />
                  Email: competent@del6.vsnl.net.in
                </td>
              </tr>

              <tr>
                <td className="border border-gray-400 px-2 py-2 w-80">D D MOTORS</td>
                <td className="border border-gray-400 px-2 py-2">
                  A-100, MAYAPURI PHASE II
                  <br />
                  Ph. No. 011-41845000, 28116502, 28115403
                  <br />
                  Fax: 28113505
                  <br />
                  Email: ddinfo@ddmotors.net
                </td>
              </tr>

              <tr>
                <td className="border border-gray-400 px-2 py-2 w-80">D D MOTORS</td>
                <td className="border border-gray-400 px-2 py-2">
                  5, WAZIRPUR INDL. AREA
                  <br />
                  NEAR WAZIRPUR BUS DEPOT
                  <br />
                  Ph. No. 011-27153999, 41843000
                  <br />
                  Fax: 27151466
                  <br />
                  Email: ddnorth@bod.net.in
                </td>
              </tr>

              <tr>
                <td className="border border-gray-400 px-2 py-2 w-80">D. D MOTORS PVT LTD.</td>
                <td className="border border-gray-400 px-2 py-2">
                  F1/9, OKHLA INDUSTRIAL AREA, PHASE 1<br />
                  NEW DELHI
                  <br />
                  Ph. No. 011-40523000
                  <br />
                  Email: dd.south@ddmotors.net, sales.south@ddmotors.net, tushar.kumar@ddmotors.net
                </td>
              </tr>

              <tr>
                <td className="border border-gray-400 px-2 py-2 w-80">
                  FAIR DEAL CARS (P) LIMITED
                </td>
                <td className="border border-gray-400 px-2 py-2">
                  485-A, JHILMIL, MAIN G.T. ROAD
                  <br />
                  SHAHDARA, DELHI
                  <br />
                  Ph. No. 011-22119626/27, 9910894050
                  <br />
                  Email: fairdealcars@rediffmail.com
                </td>
              </tr>

              <tr>
                <td className="border border-gray-400 px-2 py-2 w-80">GAUTAM MOTORS PVT LTD</td>
                <td className="border border-gray-400 px-2 py-2">
                  E-46/14, OKHLA INDUSTRIAL AREA, PHASE-II
                  <br />
                  MAIN KALKAJI ROAD
                  <br />
                  Ph. No. 011-41613879, 28613880, 28613879
                  <br />
                  Fax: 26921189
                  <br />
                  Email: gautam_sh@eth.net
                </td>
              </tr>

              <tr>
                <td className="border border-gray-400 px-2 py-2 w-80">KRISH AUTOMOTORS PVT LTD.</td>
                <td className="border border-gray-400 px-2 py-2">
                  MAM RAM MAJESTY MALL
                  <br />
                  PLOT NO.2, ROAD NO. 43
                  <br />
                  GURU HARKISHAN MARG, PITAM PURA, NEW DELHI
                  <br />
                  Ph. No. 011-32435050
                  <br />
                  Email: krishautomotors@yahoo.co.in
                </td>
              </tr>

              <tr>
                <td className="border border-gray-400 px-2 py-2 w-80">MAGIC AUTO</td>
                <td className="border border-gray-400 px-2 py-2">
                  RZ-123, VAISHALI, PALAM DABRI ROAD
                  <br />
                  DWARKA
                  <br />
                  Ph. No. 011-25397777
                  <br />
                  Email: magicauto@rediffmail.com
                </td>
              </tr>

              <tr>
                <td className="border border-gray-400 px-2 py-2 w-80">
                  MARKETING TIMES AUTOMOBILES PVT. LTD.
                </td>
                <td className="border border-gray-400 px-2 py-2">
                  A-1, CHIRAG ENCLAVE
                  <br />
                  Ph. No. 011-2629 2629
                  <br />
                  Email: maruti@marketing-times.com
                </td>
              </tr>

              <tr>
                <td className="border border-gray-400 px-2 py-2 w-80">
                  MARKETING TIMES AUTOMOBILES PVT. LTD.
                </td>
                <td className="border border-gray-400 px-2 py-2">
                  VISHAL CINEMA COMPLEX
                  <br />
                  VISHAL ENCLAVE, RAJOURI GARDEN
                  <br />
                  Ph. No. 011-25112222
                  <br />
                  Email: vishal@marketing-times.com
                </td>
              </tr>

              <tr>
                <td className="border border-gray-400 px-2 py-2 w-80">MARUTI SERVICE MASTER</td>
                <td className="border border-gray-400 px-2 py-2">
                  F-39, OKHLA IND. AREA, PHASE -2
                  <br />
                  Ph. No. 011-41612194, 41612195
                </td>
              </tr>

              <tr>
                <td className="border border-gray-400 px-2 py-2 w-80">PASCO AUTOMOBILES</td>
                <td className="border border-gray-400 px-2 py-2">
                  A-1, UDYOG NAGAR
                  <br />
                  NEW ROHTAK ROAD, PEERAGARHI
                  <br />
                  Ph. No. 011-25963535
                  <br />
                  Email: pasco@vsnl.net
                </td>
              </tr>

              <tr>
                <td className="border border-gray-400 px-2 py-2 w-80">RANA MOTORS PVT LTD</td>
                <td className="border border-gray-400 px-2 py-2">
                  RIKHI HOUSE, A 2/7 SAFDARJUNG ENCLAVE
                  <br />
                  OPP. BHIKAJI CAMA PLACE
                  <br />
                  Ph. No. 011-26712222 (10 Lines)
                  <br />
                  Fax: 26711320
                  <br />
                  Email: ranamotors@vsnl.in
                </td>
              </tr>

              <tr>
                <td className="border border-gray-400 px-2 py-2 w-80">RANA MOTORS PVT LTD</td>
                <td className="border border-gray-400 px-2 py-2">
                  TIS HAZARI METRO STATION
                  <br />
                  BOULEVARD ROAD
                  <br />
                  Ph. No. 011-23972222
                  <br />
                  Email: ranamotors@bol.net.in
                </td>
              </tr>

              <tr>
                <td className="border border-gray-400 px-2 py-2 w-80">ROHAN MOTORS LIMITED</td>
                <td className="border border-gray-400 px-2 py-2">
                  A-15, MOHAN COOP. INDUSTRIAL AREA
                  <br />
                  MATHURA ROAD
                  <br />
                  Ph. No. 011-41679303-04, 41678695-97
                  <br />
                  Fax: 51679302
                  <br />
                  Email: rmlnewdelhi@touchtelindia.net.in
                </td>
              </tr>

              <tr>
                <td className="border border-gray-400 px-2 py-2 w-80">SAYA AUTOMOBILES LTD</td>
                <td className="border border-gray-400 px-2 py-2">
                  A-21-22, G T KARNAL ROAD
                  <br />
                  INDUSTRIAL AREA
                  <br />
                  Ph. No. 011-27231955-57, 27231960, 27251402/03
                  <br />
                  Fax: 27216900
                  <br />
                  Email: saya@ndb.vsnl.net.in
                </td>
              </tr>

              <tr>
                <td className="border border-gray-400 px-2 py-2 w-80">SIKAND and COMPANY</td>
                <td className="border border-gray-400 px-2 py-2">
                  50, JANPATH
                  <br />
                  Ph. No. 011-23320450, 23310364, 23326508
                  <br />
                  Fax: 23313765
                  <br />
                  Email: hds@ndf.snl.net.in
                </td>
              </tr>

              <tr>
                <td className="border border-gray-400 px-2 py-2 w-80">
                  T R SAWHNEY MOTORS PVT LTD.
                </td>
                <td className="border border-gray-400 px-2 py-2">
                  33 AND 34, HARICHAND MELARAM COMPLEX
                  <br />
                  EAST GOKULPUR, WAZIRABAD RD
                  <br />
                  Ph. No. 011-22816777, 22816533, 22816733
                  <br />
                  Email: trsawhney@satyam.net.in
                </td>
              </tr>

              <tr>
                <td className="border border-gray-400 px-2 py-2 w-80">
                  T R SAWHNEY MOTORS PVT LTD.
                </td>
                <td className="border border-gray-400 px-2 py-2">
                  B-5, INDUSTRIAL AREA, PHASE-I, BADLI
                  <br />
                  OPP. SECTOR-18
                  <br />
                  Ph. No. 011-27853094
                  <br />
                  Email: trsawhney2@sify.com
                </td>
              </tr>

              {/* FORD */}
              <tr>
                <td colSpan={2} className="text-xl font-semibold py-2 border-0">
                  Ford Authorised Dealers
                </td>
              </tr>

              <tr>
                <td className="border border-gray-400 px-2 py-2 w-80">HARPREET FORD</td>
                <td className="border border-gray-400 px-2 py-2">
                  69/1 A, SHIVAJI MARG
                  <br />
                  MOTI NAGAR, NEW DELHI, 110015
                  <br />
                  Tel: 011-51427000-07
                  <br />
                  Fax: 011-51427021
                </td>
              </tr>

              <tr>
                <td className="border border-gray-400 px-2 py-2 w-80">SAMARA FORD</td>
                <td className="border border-gray-400 px-2 py-2">
                  40-42, TOLSTOY MARG, JANPATH
                  <br />
                  NEW DELHI, 110001
                  <br />
                  Tel: 011-51502333-6
                  <br />
                  Fax: 011-51502337
                  <br />
                  Email: samaraford@samara-group.com
                </td>
              </tr>

              <tr>
                <td className="border border-gray-400 px-2 py-2 w-80">SAMARA FORD</td>
                <td className="border border-gray-400 px-2 py-2">
                  SHOWROOM I - B-32, LAJPAT NAGAR-II
                  <br />
                  AMAR COLONY, NEW DELHI, 110024
                  <br />
                  Tel: 011-51006222-5
                  <br />
                  Fax: 011-51006226
                  <br />
                  Email: samaraford@samara-group.com
                </td>
              </tr>

              <tr>
                <td className="border border-gray-400 px-2 py-2 w-80">SOUTH CITY FORD</td>
                <td className="border border-gray-400 px-2 py-2">
                  A-38, MOHAN COOPERATIVE INDUSTRIAL AREA
                  <br />
                  MAIN MATHURA ROAD, TUGHLAKABAD
                  <br />
                  NEW DELHI, 110044
                  <br />
                  Tel: 011-51679901-04
                  <br />
                  Email: sales@southcityfordindia.com
                </td>
              </tr>

              {/* TOYOTA */}
              <tr>
                <td colSpan={2} className="text-xl font-semibold py-2 border-0">
                  Toyota Authorised Dealers
                </td>
              </tr>

              <tr>
                <td className="border border-gray-400 px-2 py-2 w-80">GALAXY TOYOTA</td>
                <td className="border border-gray-400 px-2 py-2">
                  B-23, OKHLA INDUSTRIAL AREA PHASE - 1<br />
                  NEW DELHI, 110020
                  <br />
                  Tel: 011-40577777, 011-40575434
                  <br />
                  Fax: 011-42575438
                  <br />
                  www.galaxytoyota.com
                </td>
              </tr>

              <tr>
                <td className="border border-gray-400 px-2 py-2 w-80">GALAXY TOYOTA</td>
                <td className="border border-gray-400 px-2 py-2">
                  137, 138, BHISHAM PITAMAH MARG
                  <br />
                  ARJUN NAGAR, KOTLA MUBARAKPUR
                  <br />
                  AZADPUR, NEW DELHI, 110033
                  <br />
                  Tel: 011-46577777
                  <br />
                  Fax: 011-41647939
                  <br />
                  www.galaxytoyota.com
                </td>
              </tr>

              <tr>
                <td className="border border-gray-400 px-2 py-2 w-80">GALAXY TOYOTA</td>
                <td className="border border-gray-400 px-2 py-2">
                  69/1A, NAJAFGARH ROAD, MOTI NAGAR CROSSING
                  <br />
                  MOTI NAGAR, NEW DELHI, 110015
                  <br />
                  Tel: 011-41877777, 011-41466666
                  <br />
                  Fax: 011-41427220
                  <br />
                  www.galaxytoyota.com
                </td>
              </tr>

              <tr>
                <td className="border border-gray-400 px-2 py-2 w-80">UTTAM TOYOTA</td>
                <td className="border border-gray-400 px-2 py-2">
                  95, F.I.E., PATPARGANJ INDUSTRIAL AREA
                  <br />
                  PATPER GANJ, NEW DELHI, 110092
                  <br />
                  Tel: 011-22149696
                  <br />
                  Fax: 011-41647939
                  <br />
                  www.uttamtoyota.com
                </td>
              </tr>

              {/* CHEVROLET */}
              <tr>
                <td colSpan={2} className="text-xl font-semibold py-2 border-0">
                  Chevrolet Authorised Dealers
                </td>
              </tr>

              <tr>
                <td className="border border-gray-400 px-2 py-2 w-80">AUTOVIKAS</td>
                <td className="border border-gray-400 px-2 py-2">
                  12A, SHIVAJI MARG
                  <br />
                  NEW DELHI, 110001
                  <br />
                  Tel: 011-25119021-25
                </td>
              </tr>

              <tr>
                <td className="border border-gray-400 px-2 py-2 w-80">REGENT AUTOMOBILES LTD</td>
                <td className="border border-gray-400 px-2 py-2">
                  B-1/H-1, MOHAN CO-OP. INDL. ESTATE
                  <br />
                  NEAR HALDIRAMS, MATHURA ROAD
                  <br />
                  BADARPUR, NEW DELHI, 110044
                  <br />
                  Tel: 011-26959614/617
                </td>
              </tr>

              <tr>
                <td className="border border-gray-400 px-2 py-2 w-80">
                  BRITISH MOTOR CAR CO. (1934) LTD
                </td>
                <td className="border border-gray-400 px-2 py-2">
                  PRATAP BUILDING, N BLOCK
                  <br />
                  CONNAUGHT CIRCUS
                  <br />
                  PARTAP NAGAR, NEW DELHI, 110007
                  <br />
                  Tel: 011-23725703/04
                </td>
              </tr>

              <tr>
                <td className="border border-gray-400 px-2 py-2 w-80">T&T MOTORS LTD</td>
                <td className="border border-gray-400 px-2 py-2">
                  A-2/5, OPP BHIKAJI CAMA PLACE
                  <br />
                  SAFDARJANG ENCLAVE
                  <br />
                  NEW DELHI, 110029
                  <br />
                  Tel: 011-51011401-409
                </td>
              </tr>

              <tr>
                <td className="border border-gray-400 px-2 py-2 w-80">
                  SHIVA MOTORS (GENERAL MOTORS DIVISION)
                </td>
                <td className="border border-gray-400 px-2 py-2">
                  CENTRESTAGE MALL, SECTOR-18
                  <br />
                  NOIDA, UTTAR PRADESH, 201301
                  <br />
                  Tel: 0120-2517160
                </td>
              </tr>

              <tr>
                <td className="border border-gray-400 px-2 py-2 w-80">
                  SHIVA MOTORS (GENERAL MOTORS DIVISION)
                </td>
                <td className="border border-gray-400 px-2 py-2">
                  28/3/5, SITE-IV, INDL. AREA
                  <br />
                  SAHIBABAD, GHAZIABAD, UP, 201003
                  <br />
                  Tel: 0120-2950991-93
                </td>
              </tr>

              <tr>
                <td className="border border-gray-400 px-2 py-2 w-80">KALYAN AUTO SALES</td>
                <td className="border border-gray-400 px-2 py-2">
                  7/52-B, BYE-PASS ROAD
                  <br />
                  NAGLA JAWAHAR, AGRA, UP, 282004
                  <br />
                  Tel: 0562-2522831
                </td>
              </tr>

              <tr>
                <td className="border border-gray-400 px-2 py-2 w-80">
                  BHARATI AUTOMOBILES PVT. LTD
                </td>
                <td className="border border-gray-400 px-2 py-2">
                  CTS 227, HIMALAYN TILE COMPOUND
                  <br />
                  NEAR JOGESHWARI FLYOVER
                  <br />
                  JOGESWARI, MUMBAI, 400060
                  <br />
                  Tel: 022-28301818/28302627/28302002
                  <br />
                  Email: sale@mail.bhartiautoworld.com
                </td>
              </tr>

              <tr>
                <td className="border border-gray-400 px-2 py-2 w-80">
                  FORT POINT AUTOMOTIVE PVT. LTD.
                </td>
                <td className="border border-gray-400 px-2 py-2">
                  HINDUSTAN MILLS COMPOUND
                  <br />
                  ANAND RAO NAIR MARG, SAAT RASTA
                  <br />
                  MAHALAXMI, MUMBAI, 400011
                  <br />
                  Tel: 022-23009500/23009600
                </td>
              </tr>

              <tr>
                <td className="border border-gray-400 px-2 py-2 w-80">
                  THE NATIONAL GARAGE LIMITED
                </td>
                <td className="border border-gray-400 px-2 py-2">
                  11, BHULABHAI DESAI ROAD
                  <br />
                  CUMBALA HILL, MUMBAI, 400026
                  <br />
                  Tel: 022-23516766-68
                </td>
              </tr>

              <tr>
                <td className="border border-gray-400 px-2 py-2 w-80">MPL AUTOMOBILES</td>
                <td className="border border-gray-400 px-2 py-2">
                  106, NELSON MANICKAM ROAD
                  <br />
                  AMINIJIKARAI, CHENNAI, 600029
                  <br />
                  Tel: 044-23746851-55
                </td>
              </tr>

              <tr>
                <td className="border border-gray-400 px-2 py-2 w-80">SUNDARAM MOTORS</td>
                <td className="border border-gray-400 px-2 py-2">
                  180, ANNA SALAI
                  <br />
                  CHENNAI, 600006
                  <br />
                  Tel: 044-28592517
                </td>
              </tr>

              <tr>
                <td className="border border-gray-400 px-2 py-2 w-80">APEX AUTO</td>
                <td className="border border-gray-400 px-2 py-2">
                  64-65, PHASE -IV, UDYOG VIHAR-IV
                  <br />
                  GURGAON, HARYANA, 121001
                  <br />
                  Tel: 0124-5010920-3
                </td>
              </tr>

              <tr>
                <td className="border border-gray-400 px-2 py-2 w-80">
                  BRITISH MOTOR CAR CO. (1934) LTD
                </td>
                <td className="border border-gray-400 px-2 py-2">
                  PLOT NO 112, UDYOG VIHAR-IV
                  <br />
                  GURGAON, HARYANA, 121001
                  <br />
                  Tel: 0124-2348392, 94
                </td>
              </tr>

              <tr>
                <td className="border border-gray-400 px-2 py-2 w-80">KUN AUTOMOBILES (P) LTD</td>
                <td className="border border-gray-400 px-2 py-2">
                  HOUSE NO. 1-3-1042, 43, 44, 45
                  <br />
                  KAWADIGUDA ROAD, VICEROY HOTEL LANE
                  <br />
                  HYDERABAD, AP, 500080
                  <br />
                  Tel: 040-27532385-89
                </td>
              </tr>

              <tr>
                <td className="border border-gray-400 px-2 py-2 w-80">
                  ORANGE AUTO PRIVATE LIMITED
                </td>
                <td className="border border-gray-400 px-2 py-2">
                  6-3-249/3, ABHINANDAN TOWERS
                  <br />
                  ROAD NO.1, BANJARA HILLS
                  <br />
                  HYDERABAD, AP, 500034
                  <br />
                  Tel: 040-55534567
                </td>
              </tr>

              {/* MERCEDES BENZ */}
              <tr>
                <td colSpan={2} className="text-xl font-semibold py-2 border-0">
                  Mercedes Benz Authorised Dealers
                </td>
              </tr>

              <tr>
                <td className="border border-gray-400 px-2 py-2 w-80">T&T MOTORS LTD</td>
                <td className="border border-gray-400 px-2 py-2">
                  212, OKHLA INDUSTRIAL ESTATE, PHASE III
                  <br />
                  NEW DELHI, 110020
                  <br />
                  Tel: 011-26821005-6
                  <br />
                  Fax: 011-26821013
                  <br />
                  Email: tandt@ndf.vsnl.net.in
                </td>
              </tr>

              <tr>
                <td className="border border-gray-400 px-2 py-2 w-80">T&T MOTORS LTD</td>
                <td className="border border-gray-400 px-2 py-2">
                  29, SHIVAJI MARG, OPP. CAMPA COLA FACTORY
                  <br />
                  NEW DELHI, 110020
                  <br />
                  Tel: 011-51022304-6
                  <br />
                  Fax: 011-51022307
                  <br />
                  9.00 A.M - 6.00 P.M
                </td>
              </tr>

              <tr>
                <td className="border border-gray-400 px-2 py-2 w-80">T&T MOTORS LTD</td>
                <td className="border border-gray-400 px-2 py-2">
                  G-4,5,6, MARINA HOTEL, MARINA ARCADE
                  <br />
                  CONNAUGHT PLACE, NEW DELHI, 110001
                  <br />
                  Tel: 011-23353000, 23323279, 51017620-21
                  <br />
                  Fax: 011-23327309
                  <br />
                  9.00 A.M - 6.00 P.M
                </td>
              </tr>

              <tr>
                <td className="border border-gray-400 px-2 py-2 w-80">
                  AUTO HANGAR (INDIA) PVT. LTD
                </td>
                <td className="border border-gray-400 px-2 py-2">
                  RAJAN HOUSE, GROUND FLOOR
                  <br />
                  APPASAHEB MARATHE MARG
                  <br />
                  PRABHADEVI, MUMBAI, 400025
                  <br />
                  Tel: 022-56627982-85
                  <br />
                  Fax: 022-56627986
                  <br />
                  Email: info@autohangarindia.com
                </td>
              </tr>

              <tr>
                <td className="border border-gray-400 px-2 py-2 w-80">
                  AUTO HANGAR (INDIA) PVT. LTD
                </td>
                <td className="border border-gray-400 px-2 py-2">
                  C/O MODERN AUTO, 115, DR. ANNIE BESANT ROAD
                  <br />
                  BEHIND POONAM CHAMBERS A<br />
                  WORLI, MUMBAI, 400018
                  <br />
                  Tel: 022-24921288/24937245
                  <br />
                  Fax: 022-24983122
                  <br />
                  Email: info@autohangarindia.com
                </td>
              </tr>

              <tr>
                <td className="border border-gray-400 px-2 py-2 w-80">
                  MODAK RUBBER & TEXTILE INDUSTRIAL COMPOUND
                </td>
                <td className="border border-gray-400 px-2 py-2">
                  6 KONDIVITA ROAD
                  <br />
                  ANDHERI (E), MUMBAI, 400059
                  <br />
                  Tel: 022-55701191-94
                  <br />
                  Fax: 022-28262761
                  <br />
                  Email: info@autohangarindia.com
                </td>
              </tr>

              <tr>
                <td className="border border-gray-400 px-2 py-2 w-80">SANGHI MOTORCAR CO</td>
                <td className="border border-gray-400 px-2 py-2">
                  39-A, N.S. PATKAR MARG, HUGHES ROAD
                  <br />
                  GRANT ROAD, MUMBAI, 400007
                  <br />
                  Tel: 022-23842244, 022-23805595
                  <br />
                  Email: sales@sanghimotor.com
                  <br />
                  9.00 A.M - 6.00 P.M
                </td>
              </tr>

              <tr>
                <td className="border border-gray-400 px-2 py-2 w-80">
                  MILLENNIUM MOTORS PVT. LTD
                </td>
                <td className="border border-gray-400 px-2 py-2">
                  SAFIRE PARK GALLERIA, 4<br />
                  PUNE - MUMBAI ROAD, WAKDEWADI
                  <br />
                  SHIVAJINAGAR, PUNE, 411005
                  <br />
                  Tel: 020-56085750
                  <br />
                  Fax: 020-56014008
                  <br />
                  Email: m3bsr@ddmmpl.com
                  <br />
                  10.00 A.M - 7.00 P.M
                </td>
              </tr>

              {/* FIAT */}
              <tr>
                <td colSpan={2} className="text-xl font-semibold py-2 border-0">
                  Fiat Authorised Dealers
                </td>
              </tr>

              <tr>
                <td className="border border-gray-400 px-2 py-2 w-80">SAMYAK MOTORS PVT LTD</td>
                <td className="border border-gray-400 px-2 py-2">
                  MR. NEERAJ JAIN
                  <br />
                  206 F. I. E., PATPARGANJ
                  <br />
                  NEW DELHI, 110092
                  <br />
                  Tel: 011-22162708/22162744/22167974
                  <br />
                  Mobile: 9811227332
                  <br />
                  Email: samyak2001@rediffmail.com
                </td>
              </tr>

              <tr>
                <td className="border border-gray-400 px-2 py-2 w-80">SANMATI MOTORS PVT LTD</td>
                <td className="border border-gray-400 px-2 py-2">
                  MR. RAJ KUMAR JAIN
                  <br />
                  DE-35, RAMA ROAD, INDUSTRIAL AREA
                  <br />
                  CENTRAL KIRTI NAGAR, NEW DELHI, 110015
                  <br />
                  Tel: 011-25913276/77/78/79
                  <br />
                  Mobile: 9811031324
                  <br />
                  Fax: 011-25175641
                  <br />
                  Email: smotors@bol.net.in
                </td>
              </tr>

              <tr>
                <td className="border border-gray-400 px-2 py-2 w-80">VIVEK AUTO MOBILES LTD.</td>
                <td className="border border-gray-400 px-2 py-2">
                  MR. BHUVAN NANDA
                  <br />
                  A-1 MOHAN COOP INDUSTRIAL ESTATE
                  <br />
                  MATHURA ROAD, BADARPUR, NEW DELHI, 110044
                  <br />
                  Tel: 011-26950466/26991111/12
                  <br />
                  Mobile: 9811033845
                  <br />
                  Fax: 011-26197600
                  <br />
                  Email: vivek@ndf.vsnl.net.in
                </td>
              </tr>

              <tr>
                <td className="border border-gray-400 px-2 py-2 w-80">DYNAMIC AUTO-MOBILES</td>
                <td className="border border-gray-400 px-2 py-2">
                  MR. RAJIV DEVA
                  <br />
                  A-79, SECTOR-2
                  <br />
                  NOIDA, UP, 201301
                  <br />
                  Tel: 0120-2543281-82, 2545434/35/36, 2543024
                  <br />
                  Mobile: 9811089505
                  <br />
                  Fax: 0120-2543025
                  <br />
                  Email: dautomobiles@eth.net
                </td>
              </tr>

              <tr>
                <td className="border border-gray-400 px-2 py-2 w-80">
                  ASHWA-MEGH MOTORS PVT. LTD.
                </td>
                <td className="border border-gray-400 px-2 py-2">
                  MR. YOG-ESH SHAH
                  <br />
                  685/1, PUNE-SATARA ROAD
                  <br />
                  BILBWEWADI, PUNE, 411037
                  <br />
                  Tel: 020-4210006/4210007
                  <br />
                  Mobile: 9890164485
                  <br />
                  Fax: 020-4212401
                  <br />
                  Email: ashwamegh@dishnetdsl.net
                </td>
              </tr>

              <tr>
                <td className="border border-gray-400 px-2 py-2 w-80">JAY-VIJAY MOTORS PVT. LTD</td>
                <td className="border border-gray-400 px-2 py-2"></td>
              </tr>
            </tbody>
          </table>
        </div>
      </Prose>
    </PageShell>
  );
}

export default withPageMeta(Page, PAGE_META);

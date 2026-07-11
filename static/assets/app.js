/* MKWC 2026 tracker — static build.
   Split from the original single-page app; admin/flag-editor UI removed and
   flags rendered as static PNGs. Tournament stats (scores/results) are read
   live from the same Supabase table the admin app writes to — see STATS
   DATA LOADING below — while flags stay fully static, untouched by Supabase. */
/* =========================================================
   DIAGNOSTIC TEMPORAIRE — à retirer une fois le problème trouvé
========================================================= */
const __T0 = performance.now();
function __trace(label){ console.log(`[perf] ${label} — ${(performance.now()-__T0).toFixed(0)} ms depuis le début du script`); }
try{
  new PerformanceObserver((list)=>{
    list.getEntries().forEach(e=>{
      console.log(`[longtask] ${e.duration.toFixed(0)} ms, démarré à ${(e.startTime-__T0).toFixed(0)} ms`);
    });
  }).observe({type:'longtask', buffered:true});
}catch(e){ console.log('[perf] longtask observer non supporté:', e.message); }
/* =========================================================
   DATA — TEAMS
========================================================= */
const TEAMS = {
  FR:{name:'France',flag:{k:'v3',c:['#0055A4','#FFFFFF','#EF4135']}},
  JPN:{name:'Japon',flag:{k:'dot',bg:'#FFFFFF',fg:'#BC002D'}},
  ESP:{name:'Espagne',flag:{k:'h3',c:['#AA151B','#F1BF00','#AA151B']}},
  USA:{name:'États-Unis',flag:{k:'usa',stripe:'#B22234',canton:'#3C3B6E'}},
  CAN:{name:'Canada',flag:{k:'canada',c:['#FF0000','#FFFFFF','#FF0000']}},
  ENG:{name:'Angleterre',flag:{k:'cross',bg:'#FFFFFF',fg:'#CE1124',inset:0}},
  ITA:{name:'Italie',flag:{k:'v3',c:['#008C45','#FFFFFF','#CD212A']}},
  GER:{name:'Allemagne',flag:{k:'h3',c:['#000000','#DD0000','#FFCE00']}},
  KOR:{name:'Corée du Sud',flag:{k:'korea'}},
  MEX:{name:'Mexique',flag:{k:'mexico',c:['#006847','#FFFFFF','#CE1126']}},
  BE:{name:'Belgique',flag:{k:'v3',c:['#000000','#FDDA24','#EF3340']}},
  AUS:{name:'Australie',flag:{k:'australia',bg:'#00247D'}},
  IRE:{name:'Irlande',flag:{k:'v3',c:['#169B62','#FFFFFF','#FF883E']}},
  CB:{name:'Calédonbria',flag:{k:'caledonbria'}},
  EEU:{name:'Europe de l’Est',flag:{k:'chevron',bg:'#D6402A',fg:'#F0BE4E',line:'#A94900'}},
  CL:{name:'Chili',flag:{k:'chile',white:'#FFFFFF',red:'#DA2A1C',blue:'#0032A0'}},
  VE:{name:'Venezuela',flag:{k:'venezuela',c:['#FCD116','#003893','#CF142B']}},
  PE:{name:'Pérou',flag:{k:'v3',c:['#D91023','#FFFFFF','#D91023']}},
  EC:{name:'Grande Colombie',flag:{k:'ecuador',c:['#FFDD00','#034EA2','#ED1C24']}},
  RD:{name:'Rép. Dominicaine',flag:{k:'quadcross',c1:'#002D62',c2:'#CE1126',cross:'#FFFFFF'}},
  ASIA:{name:'Asie',flag:{k:'asia',c:['#DB4040','#1C3C8A']}},
  MENA:{name:'MOAN',flag:{k:'mena',bg:'#006233'}},
  CA:{name:'Amérique Centrale',flag:{k:'h3',c:['#16225E','#FFFFFF','#16225E']}},
  PT:{name:'Portugal',flag:{k:'portugal',c:['#046A38','#DA291C']}},
  BRA:{name:'Brésil',flag:{k:'diamond',bg:'#009739',dia:'#FEDD00',dot:'#012169'}},
  CH:{name:'Suisse',flag:{k:'cross',bg:'#D52B1E',fg:'#FFFFFF',inset:1}},
  HKT:{name:'Hong Kong - Taïwan',flag:{k:'hkt'}},
  NL:{name:'Pays-Bas',flag:{k:'h3',c:['#AE1C28','#FFFFFF','#21468B']}},
  PR:{name:'Porto Rico',flag:{k:'puertorico',stripe:'#ED1C24',canton:'#0044FF'}},
  AUT:{name:'Autriche',flag:{k:'h3',c:['#ED2939','#FFFFFF','#ED2939']}},
  LUX:{name:'Luxembourg',flag:{k:'h3',c:['#ED2939','#FFFFFF','#00A1DE']}},
};

/* =========================================================
   I18N — LANGUAGE
========================================================= */
let LANG = 'en';
const LANGS = [
  {code:'en', label:'EN'},
  {code:'fr', label:'FR'},
  {code:'es', label:'ES'},
  {code:'ja', label:'JA'},
];
const TEAM_NAMES = {
  en:{FR:'France',JPN:'Japan',ESP:'Spain',USA:'United States',CAN:'Canada',ENG:'England',ITA:'Italy',GER:'Germany',KOR:'South Korea',MEX:'Mexico',BE:'Belgium',AUS:'Australia',IRE:'Ireland',CB:'Caledonbria',EEU:'Eastern Europe',CL:'Chile',VE:'Venezuela',PE:'Peru',EC:'Gran Colombia',RD:'Dominican Rep.',ASIA:'Asia',MENA:'MENA',CA:'Central America',PT:'Portugal',BRA:'Brazil',CH:'Switzerland',HKT:'Hong Kong - Taiwan',NL:'Netherlands',PR:'Puerto Rico',AUT:'Austria',LUX:'Luxembourg'},
  es:{FR:'Francia',JPN:'Japón',ESP:'España',USA:'Estados Unidos',CAN:'Canadá',ENG:'Inglaterra',ITA:'Italia',GER:'Alemania',KOR:'Corea del Sur',MEX:'México',BE:'Bélgica',AUS:'Australia',IRE:'Irlanda',CB:'Caledonbria',EEU:'Europa del Este',CL:'Chile',VE:'Venezuela',PE:'Perú',EC:'Gran Colombia',RD:'Rep. Dominicana',ASIA:'Asia',MENA:'MENA',CA:'Centroamérica',PT:'Portugal',BRA:'Brasil',CH:'Suiza',HKT:'Hong Kong - Taiwán',NL:'Países Bajos',PR:'Puerto Rico',AUT:'Austria',LUX:'Luxemburgo'},
  ja:{FR:'フランス',JPN:'日本',ESP:'スペイン',USA:'アメリカ合衆国',CAN:'カナダ',ENG:'イングランド',ITA:'イタリア',GER:'ドイツ',KOR:'韓国',MEX:'メキシコ',BE:'ベルギー',AUS:'オーストラリア',IRE:'アイルランド',CB:'カレドンブリア',EEU:'東ヨーロッパ',CL:'チリ',VE:'ベネズエラ',PE:'ペルー',EC:'グランコロンビア',RD:'ドミニカ共和国',ASIA:'アジア',MENA:'中東・北アフリカ',CA:'中央アメリカ',PT:'ポルトガル',BRA:'ブラジル',CH:'スイス',HKT:'香港・台湾',NL:'オランダ',PR:'プエルトリコ',AUT:'オーストリア',LUX:'ルクセンブルク'},
};
function teamName(tag){
  if(!tag) return tag;
  if(LANG!=='fr' && TEAM_NAMES[LANG] && TEAM_NAMES[LANG][tag]) return TEAM_NAMES[LANG][tag];
  return TEAMS[tag]?.name || tag;
}
const FULL_TEAM_NAMES = {
  fr:{RD:'République Dominicaine', MENA:'Moyen-Orient et Afrique du Nord'},
  en:{RD:'Dominican Republic', MENA:'Middle East and North Africa'},
  es:{RD:'República Dominicana', MENA:'Oriente Medio y Norte de África'},
  ja:{RD:'ドミニカ共和国', MENA:'中東・北アフリカ'},
};
function teamFullName(tag){
  const f = FULL_TEAM_NAMES[LANG] || FULL_TEAM_NAMES.fr;
  return (f && f[tag]) || teamName(tag);
}

const I18N = {
  fr:{
    liveTracking:'Suivi en direct', navHome:'Accueil', navStandings:'Classements & Bracket', navCalendar:'Calendrier', navTeams:'Équipes', navPlayers:'Stats', navFlags:'🎨 Drapeaux', navAdmin:'⚙ Admin',
    heroTitleStandings:'Classements & Bracket', heroSubStandings:'Résultats et classement de chaque groupe, et bracket final',
    homeIntro:"Bienvenue sur le site de suivi de la Coupe du Monde Mario Kart World 2026 ! 31 équipes nationales s'affrontent en trois étapes, du 10 juillet au 2 août, pour désigner le champion du monde.",
    homeFormatTitle:'Comment ça marche ?',
    homeStep1Title:'1. Phase de Play-In', homeStep1Date:'10–12 juillet', homeStep1Desc:"Le tournoi débute par la Phase de Play-In, où les équipes les moins bien classées s'affrontent pour décrocher une place dans la suite du tournoi.",
    homeStep2Title:'2. Phase de groupes', homeStep2Date:'17–19 juillet', homeStep2Desc:"Les équipes qualifiées lors du Play-In affrontent ensuite les équipes de niveau intermédiaire, dans la Phase de groupes. Pendant ce temps, les équipes les mieux classées disputent leur propre Phase de groupes, afin de déterminer leur position pour la suite du tournoi.",
    homeStep3Title:'3. Phase de Bracket', homeStep3Date:'24 juillet – 2 août', homeStep3Desc:"Le tournoi se termine par la Phase de Bracket, où les équipes les plus performantes de la Phase de groupes affrontent les équipes les mieux classées. L'équipe victorieuse de cette phase est sacrée championne du MKWC de cette année.",
    diagGroupOfFour:'Exemple de groupe', diagGroups14:'Groupes 1 à 4', diagGroupsAB:'Groupes A et B',
    diagAdvance:'continue', diagOut:'éliminé',
    homeUpcoming:'Prochains matchs', homeRecent:'Résultats récents', homeNoResults:"Aucun résultat pour l'instant.",
    homeStatusBefore:"Le tournoi n'a pas encore commencé — rendez-vous le 10 juillet 2026 !",
    homeStatusPlayin:'En ce moment : Phase de Play-In',
    homeStatusBetween1:'Phase de Play-In terminée — la Phase de groupes commence le 17 juillet',
    homeStatusGroup:'En ce moment : Phase de groupes',
    homeStatusBetween2:'Phase de groupes terminée — la Phase de Bracket commence le 24 juillet',
    homeStatusBracket:'En ce moment : Phase de Bracket',
    homeStatusAfter:'Le tournoi est terminé.', homeLiveNow:'En direct maintenant',
    thanksTitle:'Remerciements', raceChartTitle:'Évolution du score, course par course', adminTrackLabel:'Circuit',
    bestRaceLabel:'Meilleure course du tournoi', onTrack:'sur', tabTracks:'Circuits',
    tracksNote:'Score moyen obtenu sur chaque circuit, tous joueurs et tous matchs confondus.',
    colTrack:'Circuit', colRacesPlayed:'Courses jouées', colBestTrack:'Meilleur circuit', colRace:'Course',
    colConsistency:'Régularité', colClutch:'Fin de match', colBalance:'Équilibre',
    clickPlayerForTracks:'Clique sur un joueur pour voir son détail par circuit.', teamTracksTitle:'Circuits joués par l\'équipe', watchLiveTwitch:'Ce match est en direct sur Twitch — regarder maintenant',
    adminSubLabel:'Remplaçant', adminSubFromLabel:'Depuis course #', subTag:'remplaçant', thanksText:'Un grand merci au staff du tournoi pour l\'organisation et la gestion des données ! Le MKWC est organisé via <a href="https://mkcentral.com" target="_blank" rel="noopener noreferrer">MKCentral</a>, la plateforme communautaire gratuite qui gère les tournois Mario Kart.',
    homeFactTeams:'Équipes', homeFactMatches:'Matchs joués', homeFactGroups:'Groupes au total', homeFactBracketTeams:'Places en bracket',
    homeExploreTitle:'Explorer le site',
    homeLinkStandings:'Voir les classements et le bracket', homeLinkCalendar:'Consulter le calendrier complet',
    homeLinkTeams:'Découvrir les 31 équipes', homeLinkStats:'Voir les statistiques',
    heroTitleMain:'Coupe du Monde Mario Kart World', heroSubMain:'31 équipes nationales · Phase de Play-In → Phase de groupes → Phase de Bracket', heroDates:'10 JUIL → 2 AOÛT 2026',
    heroTitleCalendar:'Calendrier', heroSubCalendar:'Tous les matchs de la compétition, du 10 juillet au 2 août 2026',
    heroTitleTeams:'Équipes', heroSubTeams:'Les 31 nations en compétition',
    heroTitlePlayers:'Statistiques', heroSubPlayers:'Classement des joueurs et des équipes',
    heroTitleFlags:'Éditeur de drapeaux', heroSubFlags:'Corrige ou personnalise les drapeaux toi-même',
    heroTitleAdmin:'Administration', heroSubAdmin:'Saisie des résultats et gestion du tournoi',
    stageQuali:'Phase de Play-In', tierQuali:'Équipes les moins bien classées', noteQuali:'Les 2 premiers de chaque groupe avancent en phase de groupes.',
    stagePhaseGroupes:'Phase de groupes', subheadAB:'Groupes A & B', tierAB:'Équipes les mieux classées', noteAB:'Les 4 équipes de chaque groupe avancent en bracket.',
    subhead14:'Groupes 1 à 4', tier14:'Équipes moyennement classées', note14:'Les 2 premiers de chaque groupe avancent en bracket.',
    stageBracket:'Phase de Bracket', noteBracket:'Élimination directe à 16 équipes.',
    group:'Groupe', colTeam:'Équipe', colW:'V', colL:'D', colD:'N', colGB:'GB', colDiff:'Diff', tbd:'à définir',
    round16:'Round 1', quarterfinals:'Quarts de finale', semifinals:'Demi-finales', final:'Finale',
    dateQuali:'10–12 juil.', datePhase:'17–19 juil.', dateR16:'24 juillet', dateQF:'25 juillet', dateSF:'1 août', dateF:'2 août',
    calNoMatch:"Aucun match programmé pour l'instant — plusieurs groupes ont encore des équipes à définir.",
    upcoming:'à venir', vs:'vs',
    teamsIntro:"Clique sur un drapeau pour voir la fiche de l'équipe (joueurs, statistiques...).",
    backToTeams:'← Retour aux équipes', backToCalendar:'← Retour au calendrier', backGeneric:'Retour', statMatches:'Matchs', statW:'V', statL:'D', statDiff:'Diff', statPlayers:'Joueurs',
    bestPlayers:'Meilleurs joueurs :', ptsPerMatch:'pts/match', upcomingMatches:'Matchs à venir',
    noUpcoming:"Aucun match à venir programmé pour l'instant (adversaire pas encore déterminé, ou tous les matchs connus ont déjà été joués).",
    roster:'Effectif', searchPlaceholder:'Rechercher un joueur ou une équipe...',
    playersNote:'Classement par meilleur score moyen par match.', playersEmpty:"Aucune donnée pour l'instant — les scores se rempliront au fil des matchs.",
    tabPlayers:'Joueurs', tabTeamsStats:'Équipes', colPlayer:'Joueur', colWarsPlayed:'Matchs joués', colWinPct:'% Victoires', colAvg:'Moyenne',
    searchTeamPlaceholder:'Rechercher une équipe...', teamsStatsNote:"Classement des équipes par pourcentage de victoires, puis par différentiel de points.",
    dateQualiFull:'10–12 JUILLET', datePhaseFull:'17–19 JUILLET', dateBracketFull:'24 JUIL – 2 AOÛT',
    footer:'Projet de suivi communautaire, non affilié à Nintendo. Les données sont saisies manuellement et visibles par toute personne ayant ce lien.',
  },
  en:{
    liveTracking:'Live tracking', navHome:'Home', navStandings:'Standings & Bracket', navCalendar:'Calendar', navTeams:'Teams', navPlayers:'Stats', navFlags:'🎨 Flags', navAdmin:'⚙ Admin',
    heroTitleStandings:'Standings & Bracket', heroSubStandings:'Results and standings for every group, and the final bracket',
    homeIntro:"Welcome to the live tracker for the 2026 Mario Kart World Cup! 31 national teams compete over three stages, from July 10 to August 2, to crown the world champion.",
    homeFormatTitle:'How it works',
    homeStep1Title:'1. Play-In Stage', homeStep1Date:'July 10–12', homeStep1Desc:"The tournament commences with the Play-In Stage, where the lower-projected teams compete for a spot in the tournament proper.",
    homeStep2Title:'2. Group Stage', homeStep2Date:'July 17–19', homeStep2Desc:"The teams that advanced from the Play-In Stage compete against the middle-projected teams in the Group Stage. During this time, the higher-projected teams compete in a separate Group Stage of their own, to determine seedings for the final stage of the tournament.",
    homeStep3Title:'3. Bracket Stage', homeStep3Date:'July 24 – August 2', homeStep3Desc:"The tournament concludes with the Bracket Stage, where the best performing teams from the Group Stage compete against the higher-projected teams. The winner of this stage is crowned the champion of this year's MKWC.",
    diagGroupOfFour:'Example group', diagGroups14:'Groups 1 to 4', diagGroupsAB:'Groups A and B',
    diagAdvance:'advances', diagOut:'out',
    homeUpcoming:'Upcoming matches', homeRecent:'Recent results', homeNoResults:'No results yet.',
    homeStatusBefore:"The tournament hasn't started yet — see you on July 10, 2026!",
    homeStatusPlayin:'Happening now: Play-In Stage',
    homeStatusBetween1:'Play-In Stage finished — the Group Stage starts July 17',
    homeStatusGroup:'Happening now: Group Stage',
    homeStatusBetween2:'Group Stage finished — the Bracket Stage starts July 24',
    homeStatusBracket:'Happening now: Bracket Stage',
    homeStatusAfter:'The tournament is over.', homeLiveNow:'Live now',
    thanksTitle:'Thanks', raceChartTitle:'Score progression, race by race', adminTrackLabel:'Track',
    bestRaceLabel:'Best race of the tournament', onTrack:'on', tabTracks:'Tracks',
    tracksNote:'Average score on each track, across every player and match.',
    colTrack:'Track', colRacesPlayed:'Races played', colBestTrack:'Best track', colRace:'Race',
    colConsistency:'Consistency', colClutch:'Late-match', colBalance:'Balance',
    clickPlayerForTracks:'Click a player to see their track-by-track breakdown.', teamTracksTitle:'Tracks played by the team', watchLiveTwitch:'This match is live on Twitch — watch now',
    adminSubLabel:'Substitute', adminSubFromLabel:'From race #', subTag:'substitute', thanksText:'A big thank you to the tournament staff for the organization and data! MKWC is run through <a href="https://mkcentral.com" target="_blank" rel="noopener noreferrer">MKCentral</a>, the free community platform that manages Mario Kart tournaments.',
    homeFactTeams:'Teams', homeFactMatches:'Matches played', homeFactGroups:'Groups total', homeFactBracketTeams:'Bracket spots',
    homeExploreTitle:'Explore the site',
    homeLinkStandings:'See standings and the bracket', homeLinkCalendar:'Check the full calendar',
    homeLinkTeams:'Discover the 31 teams', homeLinkStats:'View the stats',
    heroTitleMain:'Mario Kart World Cup', heroSubMain:'31 national teams · Play-In Stage → Group Stage → Bracket Stage', heroDates:'JUL 10 → AUG 2, 2026',
    heroTitleCalendar:'Calendar', heroSubCalendar:'All matches of the competition, from July 10 to August 2, 2026',
    heroTitleTeams:'Teams', heroSubTeams:'The 31 competing nations',
    heroTitlePlayers:'Stats', heroSubPlayers:'Player and team rankings',
    heroTitleFlags:'Flag editor', heroSubFlags:'Fix or customize the flags yourself',
    heroTitleAdmin:'Administration', heroSubAdmin:'Result entry and tournament management',
    stageQuali:'Play-In Stage', tierQuali:'Lower-projected teams', noteQuali:'The top 2 of each group advance to the group stage.',
    stagePhaseGroupes:'Group Stage', subheadAB:'Groups A & B', tierAB:'Higher-projected teams', noteAB:'All 4 teams of each group advance to the bracket.',
    subhead14:'Groups 1 to 4', tier14:'Middle-projected teams', note14:'The top 2 of each group advance to the bracket.',
    stageBracket:'Bracket Stage', noteBracket:'16-team single elimination.',
    group:'Group', colTeam:'Team', colW:'W', colL:'L', colD:'D', colGB:'GB', colDiff:'Diff', tbd:'TBD',
    round16:'Round 1', quarterfinals:'Quarterfinals', semifinals:'Semifinals', final:'Final',
    dateQuali:'Jul 10–12', datePhase:'Jul 17–19', dateR16:'July 24', dateQF:'July 25', dateSF:'Aug 1', dateF:'Aug 2',
    calNoMatch:'No matches scheduled yet — several groups still have teams to be determined.',
    upcoming:'upcoming', vs:'vs',
    teamsIntro:"Click on a flag to see the team's page (players, stats...).",
    backToTeams:'← Back to teams', backToCalendar:'← Back to calendar', backGeneric:'Back', statMatches:'Matches', statW:'W', statL:'L', statDiff:'Diff', statPlayers:'Players',
    bestPlayers:'Top players:', ptsPerMatch:'pts/match', upcomingMatches:'Upcoming matches',
    noUpcoming:'No upcoming match scheduled yet (opponent not yet determined, or all known matches already played).',
    roster:'Roster', searchPlaceholder:'Search for a player or team...',
    playersNote:'Ranked by best average score per match.', playersEmpty:'No data yet — scores will fill in as matches are played.',
    tabPlayers:'Players', tabTeamsStats:'Teams', colPlayer:'Player', colWarsPlayed:'Matches played', colWinPct:'Win %', colAvg:'Average',
    searchTeamPlaceholder:'Search for a team...', teamsStatsNote:'Teams ranked by win percentage, then by point differential.',
    dateQualiFull:'JUL 10–12', datePhaseFull:'JUL 17–19', dateBracketFull:'JUL 24 – AUG 2',
    footer:"Community tracking project, not affiliated with Nintendo. Data is entered manually and visible to anyone with this link.",
  },
  es:{
    liveTracking:'Seguimiento en directo', navHome:'Inicio', navStandings:'Clasificación y Cuadro', navCalendar:'Calendario', navTeams:'Equipos', navPlayers:'Stats', navFlags:'🎨 Banderas', navAdmin:'⚙ Admin',
    heroTitleStandings:'Clasificación y Cuadro', heroSubStandings:'Resultados y clasificación de cada grupo, y el cuadro final',
    homeIntro:'¡Bienvenido al sitio de seguimiento de la Copa Mundial de Mario Kart World 2026! 31 selecciones nacionales compiten en tres fases, del 10 de julio al 2 de agosto, para coronar al campeón del mundo.',
    homeFormatTitle:'¿Cómo funciona?',
    homeStep1Title:'1. Fase de Play-In', homeStep1Date:'10–12 de julio', homeStep1Desc:'El torneo comienza con la Fase de Play-In, donde los equipos con menor proyección compiten por un puesto en el torneo principal.',
    homeStep2Title:'2. Fase de grupos', homeStep2Date:'17–19 de julio', homeStep2Desc:'Los equipos que avanzaron desde la Fase de Play-In se enfrentan a los equipos de proyección media en la Fase de grupos. Mientras tanto, los equipos con mejor proyección disputan su propia Fase de grupos, para determinar su posición de cara a la fase final del torneo.',
    homeStep3Title:'3. Fase de Bracket', homeStep3Date:'24 de julio – 2 de agosto', homeStep3Desc:'El torneo concluye con la Fase de Bracket, donde los equipos con mejor desempeño de la Fase de grupos se enfrentan a los equipos con mejor proyección. El vencedor de esta fase es coronado campeón del MKWC de este año.',
    diagGroupOfFour:'Grupo de ejemplo', diagGroups14:'Grupos 1 a 4', diagGroupsAB:'Grupos A y B',
    diagAdvance:'avanza', diagOut:'eliminado',
    homeUpcoming:'Próximos partidos', homeRecent:'Resultados recientes', homeNoResults:'Todavía no hay resultados.',
    homeStatusBefore:'¡El torneo aún no ha comenzado — nos vemos el 10 de julio de 2026!',
    homeStatusPlayin:'Ahora mismo: Fase de Play-In',
    homeStatusBetween1:'Fase de Play-In terminada — la Fase de grupos empieza el 17 de julio',
    homeStatusGroup:'Ahora mismo: Fase de grupos',
    homeStatusBetween2:'Fase de grupos terminada — la Fase de Bracket empieza el 24 de julio',
    homeStatusBracket:'Ahora mismo: Fase de Bracket',
    homeStatusAfter:'El torneo ha terminado.', homeLiveNow:'En directo ahora',
    thanksTitle:'Agradecimientos', raceChartTitle:'Evolución del puntaje, carrera por carrera', adminTrackLabel:'Circuito',
    bestRaceLabel:'Mejor carrera del torneo', onTrack:'en', tabTracks:'Circuitos',
    tracksNote:'Puntuación media obtenida en cada circuito, entre todos los jugadores y partidos.',
    colTrack:'Circuito', colRacesPlayed:'Carreras jugadas', colBestTrack:'Mejor circuito', colRace:'Carrera',
    colConsistency:'Regularidad', colClutch:'Final de partido', colBalance:'Equilibrio',
    clickPlayerForTracks:'Haz clic en un jugador para ver su detalle por circuito.', teamTracksTitle:'Circuitos jugados por el equipo', watchLiveTwitch:'Este partido está en directo en Twitch — verlo ahora',
    adminSubLabel:'Suplente', adminSubFromLabel:'Desde carrera #', subTag:'suplente', thanksText:'¡Un gran agradecimiento al staff del torneo por la organización y los datos! El MKWC se organiza a través de <a href="https://mkcentral.com" target="_blank" rel="noopener noreferrer">MKCentral</a>, la plataforma comunitaria gratuita que gestiona los torneos de Mario Kart.',
    homeFactTeams:'Equipos', homeFactMatches:'Partidos jugados', homeFactGroups:'Grupos en total', homeFactBracketTeams:'Plazas en el bracket',
    homeExploreTitle:'Explorar el sitio',
    homeLinkStandings:'Ver la clasificación y el cuadro', homeLinkCalendar:'Consultar el calendario completo',
    homeLinkTeams:'Descubrir los 31 equipos', homeLinkStats:'Ver las estadísticas',
    heroTitleMain:'Copa Mundial de Mario Kart World', heroSubMain:'31 selecciones nacionales · Fase de Play-In → Fase de grupos → Fase de Bracket', heroDates:'10 JUL → 2 AGO 2026',
    heroTitleCalendar:'Calendario', heroSubCalendar:'Todos los partidos de la competición, del 10 de julio al 2 de agosto de 2026',
    heroTitleTeams:'Equipos', heroSubTeams:'Las 31 naciones en competición',
    heroTitlePlayers:'Estadísticas', heroSubPlayers:'Clasificación de jugadores y equipos',
    heroTitleFlags:'Editor de banderas', heroSubFlags:'Corrige o personaliza las banderas tú misma',
    heroTitleAdmin:'Administración', heroSubAdmin:'Introducción de resultados y gestión del torneo',
    stageQuali:'Fase de Play-In', tierQuali:'Equipos con proyección más baja', noteQuali:'Los 2 primeros de cada grupo avanzan a la fase de grupos.',
    stagePhaseGroupes:'Fase de grupos', subheadAB:'Grupos A y B', tierAB:'Equipos con proyección más alta', noteAB:'Los 4 equipos de cada grupo avanzan al cuadro final.',
    subhead14:'Grupos 1 a 4', tier14:'Equipos con proyección media', note14:'Los 2 primeros de cada grupo avanzan al cuadro final.',
    stageBracket:'Fase de Bracket', noteBracket:'Eliminación directa a 16 equipos.',
    group:'Grupo', colTeam:'Equipo', colW:'G', colL:'P', colD:'E', colGB:'GB', colDiff:'Dif', tbd:'por determinar',
    round16:'Ronda 1', quarterfinals:'Cuartos de final', semifinals:'Semifinales', final:'Final',
    dateQuali:'10–12 jul.', datePhase:'17–19 jul.', dateR16:'24 de julio', dateQF:'25 de julio', dateSF:'1 de agosto', dateF:'2 de agosto',
    calNoMatch:'Todavía no hay partidos programados — varios grupos aún tienen equipos por determinar.',
    upcoming:'por jugar', vs:'vs',
    teamsIntro:'Haz clic en una bandera para ver la ficha del equipo (jugadores, estadísticas...).',
    backToTeams:'← Volver a equipos', backToCalendar:'← Volver al calendario', backGeneric:'Volver', statMatches:'Partidos', statW:'G', statL:'P', statDiff:'Dif', statPlayers:'Jugadores',
    bestPlayers:'Mejores jugadores:', ptsPerMatch:'pts/partido', upcomingMatches:'Próximos partidos',
    noUpcoming:'No hay próximos partidos programados por ahora (rival aún no determinado, o todos los partidos conocidos ya se jugaron).',
    roster:'Plantilla', searchPlaceholder:'Buscar un jugador o equipo...',
    playersNote:'Clasificación por mejor puntuación media por partido.', playersEmpty:'Todavía no hay datos — las puntuaciones se irán completando con los partidos.',
    tabPlayers:'Jugadores', tabTeamsStats:'Equipos', colPlayer:'Jugador', colWarsPlayed:'Partidos jugados', colWinPct:'% Victorias', colAvg:'Media',
    searchTeamPlaceholder:'Buscar un equipo...', teamsStatsNote:'Equipos clasificados por porcentaje de victorias, luego por diferencia de puntos.',
    dateQualiFull:'10–12 JUL', datePhaseFull:'17–19 JUL', dateBracketFull:'24 JUL – 2 AGO',
    footer:'Proyecto de seguimiento comunitario, no afiliado a Nintendo. Los datos se introducen manualmente y son visibles para cualquiera que tenga este enlace.',
  },
  ja:{
    liveTracking:'ライブ速報', navHome:'ホーム', navStandings:'順位表・トーナメント表', navCalendar:'カレンダー', navTeams:'チーム', navPlayers:'スタッツ', navFlags:'🎨 旗エディタ', navAdmin:'⚙ 管理者',
    heroTitleStandings:'順位表・トーナメント表', heroSubStandings:'各グループの結果・順位と決勝トーナメント表',
    homeIntro:'マリオカートワールドカップ2026 ライブ速報サイトへようこそ！31の国・地域代表チームが7月10日から8月2日まで3つのステージを戦い、世界チャンピオンを決定します。',
    homeFormatTitle:'大会形式',
    homeStep1Title:'1. プレイインステージ', homeStep1Date:'7月10〜12日', homeStep1Desc:'大会はプレイインステージから始まります。下位予想のチームが、本戦への出場権をかけて対戦します。',
    homeStep2Title:'2. グループステージ', homeStep2Date:'7月17〜19日', homeStep2Desc:'プレイインステージを勝ち抜いたチームは、グループステージで中位予想のチームと対戦します。同じ時期に、上位予想のチームは独自のグループステージを戦い、大会最終ステージに向けたシード順位を決定します。',
    homeStep3Title:'3. ブラケットステージ', homeStep3Date:'7月24日〜8月2日', homeStep3Desc:'大会はブラケットステージで幕を閉じます。グループステージで好成績を収めたチームが、上位予想のチームと対戦します。このステージを制したチームが、今年のMKWCチャンピオンに輝きます。',
    diagGroupOfFour:'グループの例', diagGroups14:'グループ1〜4', diagGroupsAB:'グループA・B',
    diagAdvance:'進出', diagOut:'敗退',
    homeUpcoming:'今後の試合', homeRecent:'最近の結果', homeNoResults:'まだ結果はありません。',
    homeStatusBefore:'大会はまだ始まっていません — 2026年7月10日にお会いしましょう！',
    homeStatusPlayin:'現在開催中：プレイインステージ',
    homeStatusBetween1:'プレイインステージ終了 — グループステージは7月17日開始',
    homeStatusGroup:'現在開催中：グループステージ',
    homeStatusBetween2:'グループステージ終了 — ブラケットステージは7月24日開始',
    homeStatusBracket:'現在開催中：ブラケットステージ',
    homeStatusAfter:'大会は終了しました。', homeLiveNow:'ライブ配信中',
    thanksTitle:'謝辞', raceChartTitle:'レースごとのスコア推移', adminTrackLabel:'コース',
    bestRaceLabel:'大会最高スコア', onTrack:'コース：', tabTracks:'コース',
    tracksNote:'各コースの、全選手・全試合を通じた平均スコアです。',
    colTrack:'コース', colRacesPlayed:'走行回数', colBestTrack:'得意コース', colRace:'レース',
    colConsistency:'安定性', colClutch:'終盤の伸び', colBalance:'バランス',
    clickPlayerForTracks:'選手をクリックするとコース別の詳細が見られます。', teamTracksTitle:'チームが走行したコース', watchLiveTwitch:'この試合はTwitchでライブ配信中 — 今すぐ見る',
    adminSubLabel:'交代選手', adminSubFromLabel:'何レース目から', subTag:'交代', thanksText:'大会の運営とデータ管理をしてくださるスタッフの皆さんに感謝します！MKWCは、マリオカートの大会を運営する無料のコミュニティプラットフォーム<a href="https://mkcentral.com" target="_blank" rel="noopener noreferrer">MKCentral</a>を通じて開催されています。',
    homeFactTeams:'チーム数', homeFactMatches:'消化試合数', homeFactGroups:'総グループ数', homeFactBracketTeams:'決勝T出場枠',
    homeExploreTitle:'サイトを見る',
    homeLinkStandings:'順位表とトーナメント表を見る', homeLinkCalendar:'全カレンダーを見る',
    homeLinkTeams:'31チームを見る', homeLinkStats:'スタッツを見る',
    heroTitleMain:'マリオカートワールドカップ', heroSubMain:'31の国別代表チーム · プレイインステージ → グループステージ → ブラケットステージ', heroDates:'7月10日 → 8月2日 2026',
    heroTitleCalendar:'カレンダー', heroSubCalendar:'2026年7月10日から8月2日までの全試合',
    heroTitleTeams:'チーム', heroSubTeams:'出場31か国・地域',
    heroTitlePlayers:'スタッツ', heroSubPlayers:'選手・チームランキング',
    heroTitleFlags:'旗エディタ', heroSubFlags:'旗を自分で修正・カスタマイズできます',
    heroTitleAdmin:'管理者ページ', heroSubAdmin:'試合結果の入力と大会管理',
    stageQuali:'プレイインステージ', tierQuali:'下位予想チーム', noteQuali:'各組上位2チームがグループステージに進出。',
    stagePhaseGroupes:'グループステージ', subheadAB:'グループA・B', tierAB:'上位予想チーム', noteAB:'各グループの4チーム全てが決勝トーナメントに進出。',
    subhead14:'グループ1〜4', tier14:'中位予想チーム', note14:'各グループの上位2チームが決勝トーナメントに進出。',
    stageBracket:'ブラケットステージ', noteBracket:'16チームによるノックアウト方式。',
    group:'グループ', colTeam:'チーム', colW:'勝', colL:'負', colD:'分', colGB:'GB', colDiff:'得失点差', tbd:'未定',
    round16:'ラウンド1', quarterfinals:'準々決勝', semifinals:'準決勝', final:'決勝',
    dateQuali:'7月10〜12日', datePhase:'7月17〜19日', dateR16:'7月24日', dateQF:'7月25日', dateSF:'8月1日', dateF:'8月2日',
    calNoMatch:'まだ試合は組まれていません — いくつかのグループはチームが未確定です。',
    upcoming:'試合前', vs:'vs',
    teamsIntro:'旗をクリックするとチームページ（選手、成績など）が表示されます。',
    backToTeams:'← チーム一覧に戻る', backToCalendar:'← カレンダーに戻る', backGeneric:'戻る', statMatches:'試合数', statW:'勝', statL:'負', statDiff:'得失点差', statPlayers:'選手数',
    bestPlayers:'注目選手：', ptsPerMatch:'点/試合', upcomingMatches:'今後の試合',
    noUpcoming:'現在予定されている試合はありません（対戦相手が未確定、またはすべての既知の試合が終了しています）。',
    roster:'メンバー', searchPlaceholder:'選手名またはチーム名で検索...',
    playersNote:'試合平均得点によるランキングです。', playersEmpty:'まだデータがありません — 試合が進むとスコアが表示されます。',
    tabPlayers:'選手', tabTeamsStats:'チーム', colPlayer:'選手', colWarsPlayed:'試合数', colWinPct:'勝率', colAvg:'平均',
    searchTeamPlaceholder:'チームを検索...', teamsStatsNote:'勝率、次に得失点差でランキングしたチーム一覧です。',
    dateQualiFull:'7月10〜12日', datePhaseFull:'7月17〜19日', dateBracketFull:'7月24日〜8月2日',
    footer:'非公式のコミュニティ運営プロジェクトです（任天堂とは無関係）。データは手動で入力されており、このリンクを持つ全員に表示されます。',
  },
};
function t(key){ return (I18N[LANG] && I18N[LANG][key]) || I18N.fr[key] || key; }

const QUALI_GROUPS = {
  W:{teams:['VE','PE','EC','RD'], feedsInto:'1'},
  X:{teams:['EEU','MENA','CA','PT'], feedsInto:'2'},
  Y:{teams:['NL','PR','AUT','LUX'], feedsInto:'3'},
  Z:{teams:['HKT','BRA','CH'], feedsInto:'4'},
};
// Confirmed kickoff times, as announced by the organizers (given in Belgium time, UTC+2 in July).
// Stored with an explicit offset so every visitor's browser can convert to their own local time automatically.
const SCHEDULED_TIMES = {
  'quali|W|0-3':'2026-07-11T00:00:00+02:00',
  'quali|W|1-3':'2026-07-12T00:00:00+02:00',
  'quali|W|1-2':'2026-07-12T22:00:00+02:00',
  'quali|W|0-1':'2026-07-12T23:00:00+02:00',
  'quali|W|0-2':'2026-07-13T00:00:00+02:00',
  'quali|W|2-3':'2026-07-13T01:00:00+02:00',
  'quali|X|0-1':'2026-07-10T21:00:00+02:00',
  'quali|X|1-3':'2026-07-10T22:00:00+02:00',
  'quali|X|2-3':'2026-07-11T21:00:00+02:00',
  'quali|X|0-2':'2026-07-11T22:00:00+02:00',
  'quali|X|1-2':'2026-07-12T21:00:00+02:00',
  'quali|X|0-3':'2026-07-12T21:00:00+02:00',
  'quali|Y|0-3':'2026-07-11T21:00:00+02:00',
  'quali|Y|2-3':'2026-07-12T20:00:00+02:00',
  'quali|Y|0-1':'2026-07-12T20:00:00+02:00',
  'quali|Y|0-2':'2026-07-12T21:00:00+02:00',
  'quali|Y|1-3':'2026-07-12T21:00:00+02:00',
  'quali|Y|1-2':'2026-07-12T22:00:00+02:00',
  'quali|Z|0-1':'2026-07-11T16:00:00+02:00',
  'quali|Z|0-2':'2026-07-11T17:00:00+02:00',
  'quali|Z|1-2':'2026-07-12T22:00:00+02:00',
};
function scheduledTimeFor(anchorPrefix, groupId, key){
  return SCHEDULED_TIMES[`${anchorPrefix}|${groupId}|${key}`] || null;
}
function localeForLang(){
  return { fr:'fr-FR', en:'en-US', es:'es-ES', ja:'ja-JP' }[LANG] || 'en-US';
}
function localDateKey(iso){
  // Never slice the raw ISO string for this — it's written in Belgium's timezone,
  // so slicing it would give Belgium's calendar date, not the visitor's. Building a
  // real Date object and reading its LOCAL year/month/day gives the calendar day as
  // that specific visitor's browser sees it, which is what determines which day's
  // section a match belongs in for them.
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function formatScheduledLocal(iso){
  // The locale (which language the date is written in) follows the site's own
  // language switcher. The timezone itself is still the visitor's own — that part
  // is automatic and untouched, since we never pass an explicit timeZone option.
  const d = new Date(iso);
  let out = d.toLocaleString(localeForLang(), { weekday:'short', month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' });
  // English's 12-hour clock famously confuses 12 AM/PM for midnight/noon — spell it out
  // plainly instead. The other languages here already use an unambiguous 24h clock.
  if(LANG==='en') out = out.replace('12:00 AM', 'Midnight').replace('12:00 PM', 'Noon');
  return out;
}
function formatScheduledLocalDateOnly(iso){
  const d = new Date(iso);
  return d.toLocaleDateString(localeForLang(), { weekday:'short', month:'short', day:'numeric' });
}
const MID_GROUPS = {
  '1':{fixed:['KOR','MEX'], hint:'Groupe W'},
  '2':{fixed:['BE','AUS'], hint:'Groupe X'},
  '3':{fixed:['IRE','CB'], hint:'Groupe Y'},
  '4':{fixed:['ASIA','CL'], hint:'Groupe Z'},
};
const TOP_GROUPS = {
  A:{teams:['FR','ESP','CAN','ITA']},
  B:{teams:['JPN','USA','ENG','GER']},
};
function ROUND_NAMES_F(){ return [t('round16'), t('quarterfinals'), t('semifinals'), t('final')]; }
function ROUND_DATES_F(){ return [t('dateR16'), t('dateQF'), t('dateSF'), t('dateF')]; }
function pairsFor(n){ const p=[]; for(let i=0;i<n;i++) for(let j=i+1;j<n;j++) p.push([i,j]); return p; }

/* =========================================================
   DATA — ROSTERS  ("Nom|Nat|Rôle" — Rôle: C=Capitaine, R=Représentant, vide=Joueur)
========================================================= */
const ROSTERS = {
NL:["alpaco|NL|","big floppa/Justin|NL|","Carpie|NL|","Jerry|NL|R","Mees|NL|","Moomoo|NL|","Qadim|NL|","Shai|NL|","Slak|NL|","Snowboar|NL|","SpRayRayray|NL|","Stroopwafl|NL|C","TrikkyFeFox|NL|","vantox|NL|R","YoungBreezy|NL|"],
ITA:["Arujo|IT|","Domenico|IT|","DUGO|IT|","Ferro|IT|","Francy|IT|","marione|IT|","Lore|IT|","Lucky79|IT|","multi|IT|","Nico|IT|","Ropollo|IT|","Soma|IT|","Spike|IT|","YoshiItalia|IT|"],
IRE:["Camdizzle|IE|","ceelyan / yan|IE|","Dman|IE|","Emmyy|IE|","kyle / jyle|IE|","Lucer|IE|","Megurine Luka|IE|","Menis111|IE|","Mist|IE|","Owenn / Ampharos|IE|","Queen|IE|","Rockitoy|IE|","roy|IE|","sketch|IE|","The Mystery|IE|"],
GER:["Aurora|DE|","cloud|DE|","FakeFire|DE|","JOJO www|DE|","Julian / BlueJ|DE|","Kevino / Moino|DE|","LèzardAlkohol|DE|","MicheL / ホへ|DE|","olliiiibtw|DE|","RayOS|DE|","SaGaBOT|DE|","Sp3dy|DE|","Staticalx|DE|"],
USA:["Arezu|US|","AyyJayy|US|","CPE|US|","green|US|","gyrodos|US|","Mirymeg|US|","Nick|US|","oxy|US|","Pepe8610|US|","SideB|US|","Unkwn|US|","yezy|US|","yoshira|US|"],
ENG:["Gold/Maisie|GB|","Ralsei|GB|","Hazza|GB|","James|GB|","Lee|GB|","L1am|GB|","Nxvy|GB|","oj|GB|","q.|GB|","RyanBritish|GB|","season|GB|","shiba|GB|","syn|GB|"],
FR:["corrmo|FR|","Kirio|FR|","LOLmdr|FR|","OsDras|FR|","Popoff|FR|","Saru|FR|","Starlow|FR|","starxlx|FR|","Valer|FR|","WawayZz|FR|"],
CA:["AFCHuayra / Garuda|CAM|","Anemoi Asura|CAM|","Azelix/Rei/Momone|CAM|","Cerezagt|CAM|","Clawx/Hak/Yamada|CAM|","CRISTHIAN|CAM|","Dark|CAM|","Fercho|CAM|","Gaboide|CAM|","J.Papu|CAM|","Lawx/Kanata|CAM|","Mucio|CAM|","Noname09|CAM|","PANDUX|CAM|","zXFlare|CAM|"],
VE:["Aarones / Adokill|VE|","AK20|VE|","cosiam|VE|","Diego6|VE|","Fuuse/Nejire-san|VE|","G0thgrl......|VE|","Heb|VE|","José A.|VE|","kiwillius|VE|","Kr1ps|VE|","Monkey/Anna/Nami|VE|","RK CR0NO 64|VE|","Santipajas|VE|","Suarez|VE|","Suca|VE|"],
CB:["Chara|CBR|","FlashGordon|CBR|","Geozaki|CBR|","hrsnab|CBR|","Jacob147|CBR|","Keiran/Sylvio/Luigi|CBR|","Lucas / Chungus / Moose|CBR|","Mints|CBR|","Nathaniel/Wheels|CBR|","Nisc$|CBR|","Pigeon/Faye|CBR|","QuagStar|CBR|","TopHatBear / Alex|CBR|","Willo|CBR|"],
LUX:["Blume187 / Nee Diggi|LU|","Butter_Chicken|LU|","Charel|LU|","James|LU|","Kakpu|LU|","Liam|LU|","Lowbro|LU|","Luca|LU|","MisterLPM|LU|","Rahpa 28|LU|","Spielpro|LU|","Francis|LU|","Yasn|LU|"],
PT:["D3lt4/Froholdt/Will|PT|C","Lora|PT|R","Veigh|PT|R","Dump|PT|","Gerras15|PT|","Koshi|PT|","mozartx|PT|","ociuQ|PT|","SiniD|PT|","stendal8|PT|"],
RD:["Morioh|DO|","Ai|DO|","Edgar|DO|","Mejary Ikana|DO|",":Ðylands|DO|","Casquito05|DO|","Cero|DO|","Daro|DO|","Den|DO|","Elbrixx|DO|","Electric|DO|","Lopechoux|DO|","Pinek|DO|"],
JPN:["くさあん|JP|","おかし|JP|","カプたろう|JP|","Purple|JP|","Dianb|JP|","Li4z|JP|","Loberia|JP|","Baku|JP|","ねるね|JP|","Mus|JP|","もあ|JP|"],
KOR:["Bsy|KR|","Comet0307|KR|","dive|KR|","Tears|KR|","Afrogut|KR|","C2K|KR|","Hunyjoa|KR|","Jiwoo23|KR|","reze_mkw|KR|","Sinseiga|KR|","sjdsnrb|KR|","spidochex|KR|"],
EC:["Asta/Mimosa|EC|","Chispita|EC|","cyn|EC|","Espín|CO|","Elysia|CO|","Emilio|CO|","INGE|EC|","Javivi/Toad|CO|","Julian|CO|","Nicemm|EC|","null|CO|","PedroCV|CO|","POW|CO|","Royals|CO|","Sorriso|CO|"],
BE:["Azrok|BE|","BidKip|BE|","Chiaki Nanami|BE|","GuiLeC|BE|","Ice-C0C0 / Balerdi|BE|","Junko Enoshima|BE|","Kinun|BE|","Kuru / Yuta Okkotsu|BE|","Makoto Naegi|BE|","Thomas|BE|","zertox|BE|"],
MENA:["Lécka|DZ|","Eyad|EG|","spoke|JO|","Baguette|LB|","Georgio|LB|","Froej|MA|","Joy Boy 75|MA|","P0C0|MA|","Manny|SA|","Zouzou|TN|","negf|AE|"],
CL:["Milotic|CL|","Engel|CL|","Rompe|CL|","Benja|CL|","Yiyo|CL|","Naldo|CL|","Marlon|CL|","Kenthix|CL|","iLyOniiX|CL|","Azel|CL|","Larry|CL|","Mauri|CL|","Zebrax|CL|","AverageGuy|CL|","Lukast|CL|"],
ASIA:["Pink|SG|","Haruka|VN|","pzyko103|PH|","Silver|ID|","VC|PH|","damien øwł|SG|","Tea|IN|","Mashi|IN|","EmilP|IN|","Etane/Cane's|VN|"],
CH:["Aranaut|CH|","Audi|CH|","Cocolerat|CH|","David JUNGO RODRÍGUEZ|CH|","dipshaaLex|CH|","Dragzy|CH|","Hapr|CH|","milololo1|CH|","Mudky|CH|","No|CH|","Pein36|CH|","TrueFortune|CH|","Xooo/Chris|CH|"],
HKT:["Alvin|HK|","Barrett|HK|","Charlie|HK|","Nova|HK|","AE87|TW|","isuc|TW|","MaxUU|TW|","Roboppy|TW|","sssgs|TW|","Tef|TW|","zduj|TW|"],
AUT:["ACK|AT|","DarkDave|AT|","David|AT|","Dürni / mzinho|AT|","izzy|AT|","Lukas2003|AT|","MissLoreen|AT|","Niralamus|AT|","tarek ballhog|AT|","TimiQC|AT|","Zocka|AT|"],
AUS:["badders/Goomba|AU|","Ace|AU|","Borger|AU|","Fantasy Olive|AU|","hendrixx|AU|","Kod|AU|","Minh / Okita / Tamamo|AU|","nanimononai|AU|","Optik|AU|","Starcast|AU|","SwagGamer47|AU|","TKDropBear|AU|","SweetOnion|AU|"],
ESP:["César|ES|","Guti|ES|","Aleformula|ES|","Cleisi|ES|","Mortlas|ES|","Aleek|ES|","Aketx|ES|","imasanvi|ES|","Super_BC|ES|","AxeeL14|ES|","ivanchuuu|ES|","DANIPRO|ES|","Jandro|ES|"],
MEX:["Bonais / Rowlet|MX|","Braan|MX|","Civan / CHOLO-DU PLESSIS|MX|","Clöve|MX|","Cynical|MX|","Dxt|MX|","fade|MX|","H3ar|MX|","iono|MX|","Keinster|MX|","Kevo|MX|","Kingcv|MX|","LuisMX|MX|","R_Mantis/RMantis/Tachyon|MX|","Uriel5_5|MX|"],
EEU:["3plashy|TR|","Alen|BA|","Aqua/Feur/Zabuza|RO|","FraX|PL|","GrilledDuck|HU|","GZUZ/Bachira/Montemanyes|AL|","Josemi|RO|","Lyona|RS|","NickFanboy|GR|","Shag/Jari Reuker/Rydz|PL|","Shdw|PL|","soli/ryosei|RO|","Thunder/Satoru/βailey's|BG|","ZBL|PL|"],
BRA:["Bert|BR|","Eduardoros|BR|","Faw|BR|","ItsCJ|BR|","Ktpg|BR|","Kuri|BR|","Larakitty|BR|","Lipix|BR|","Maximusrob|BR|","MegaBadHector|BR|","MegaLeoMania (mlm)|BR|","RaisedNewt42|BR|","Rick|BR|"],
PR:["Steez|PR|","figs|PR|","MelloYello|PR|","Casual|PR|","Kikita|PR|","Lightning|PR|","MORAL3S|PR|","Panda Exotico|PR|","Piolin / Sayori|PR|","RBN|PR|","Sрαяκγ|PR|","Sushiberry|PR|","Mona|PR|","Diegoat|PR|","Fetch|PR|"],
PE:["Splendy|PE|","PieHat|PE|","DanSune|PE|","Francis|PE|","Gabo|PE|","Josuan|PE|","JuanP|PE|","Katusso/Rimuru|PE|","Lucas|PE|","Yostifu|PE|","LucSen|PE|","AlexBoo|PE|"],
CAN:["Arti|CA|","aryhn|CA|","Bape|CA|","JPGiviner|CA|","pcklee|CA|","sopt|CA|","Teeples|CA|","Thunda|CA|","Tyler|CA|","Tyson|CA|"],
};
function roster(tag){
  return (ROSTERS[tag]||[]).map(s=>{ const [n,nat,r]=s.split('|'); return {n,nat,r:r||'J'}; });
}
const NAT_NAMES = {
  fr:{AE:'Émirats arabes unis',AL:'Albanie',AT:'Autriche',AU:'Australie',BE:'Belgique',BG:'Bulgarie',BR:'Brésil',CA:'Canada',CH:'Suisse',CL:'Chili',CO:'Colombie',CR:'Costa Rica',DE:'Allemagne',DO:'Rép. Dominicaine',EC:'Équateur',EE:'Estonie',EG:'Égypte',ES:'Espagne',FR:'France',GB:'Royaume-Uni',GR:'Grèce',GT:'Guatemala',HK:'Hong Kong',HN:'Honduras',HU:'Hongrie',ID:'Indonésie',IE:'Irlande',IN:'Inde',IT:'Italie',JO:'Jordanie',JP:'Japon',KR:'Corée du Sud',LB:'Liban',LU:'Luxembourg',MA:'Maroc',MX:'Mexique',NL:'Pays-Bas',PA:'Panama',PE:'Pérou',PH:'Philippines',PL:'Pologne',PR:'Porto Rico',PT:'Portugal',RO:'Roumanie',SA:'Arabie saoudite',SG:'Singapour',SV:'Salvador',TN:'Tunisie',TR:'Turquie',TW:'Taïwan',US:'États-Unis',VE:'Venezuela',VN:'Vietnam',CAM:'Amérique centrale',CBR:'Calédonbria',MEN:'Moyen-Orient et Afrique du Nord',EEU:'Europe de l\'Est',ASIA:'Asie',HKT:'Hong Kong - Taïwan',GCO:'Grande Colombie',DZ:'Algérie',BA:'Bosnie-Herzégovine',RS:'Serbie'},
  en:{AE:'United Arab Emirates',AL:'Albania',AT:'Austria',AU:'Australia',BE:'Belgium',BG:'Bulgaria',BR:'Brazil',CA:'Canada',CH:'Switzerland',CL:'Chile',CO:'Colombia',CR:'Costa Rica',DE:'Germany',DO:'Dominican Rep.',EC:'Ecuador',EE:'Estonia',EG:'Egypt',ES:'Spain',FR:'France',GB:'United Kingdom',GR:'Greece',GT:'Guatemala',HK:'Hong Kong',HN:'Honduras',HU:'Hungary',ID:'Indonesia',IE:'Ireland',IN:'India',IT:'Italy',JO:'Jordan',JP:'Japan',KR:'South Korea',LB:'Lebanon',LU:'Luxembourg',MA:'Morocco',MX:'Mexico',NL:'Netherlands',PA:'Panama',PE:'Peru',PH:'Philippines',PL:'Poland',PR:'Puerto Rico',PT:'Portugal',RO:'Romania',SA:'Saudi Arabia',SG:'Singapore',SV:'El Salvador',TN:'Tunisia',TR:'Turkey',TW:'Taiwan',US:'United States',VE:'Venezuela',VN:'Vietnam',CAM:'Central America',CBR:'Caledonbria',MEN:'Middle East and North Africa',EEU:'Eastern Europe',ASIA:'Asia',HKT:'Hong Kong - Taiwan',GCO:'Greater Colombia',DZ:'Algeria',BA:'Bosnia and Herzegovina',RS:'Serbia'},
  es:{AE:'Emiratos Árabes Unidos',AL:'Albania',AT:'Austria',AU:'Australia',BE:'Bélgica',BG:'Bulgaria',BR:'Brasil',CA:'Canadá',CH:'Suiza',CL:'Chile',CO:'Colombia',CR:'Costa Rica',DE:'Alemania',DO:'Rep. Dominicana',EC:'Ecuador',EE:'Estonia',EG:'Egipto',ES:'España',FR:'Francia',GB:'Reino Unido',GR:'Grecia',GT:'Guatemala',HK:'Hong Kong',HN:'Honduras',HU:'Hungría',ID:'Indonesia',IE:'Irlanda',IN:'India',IT:'Italia',JO:'Jordania',JP:'Japón',KR:'Corea del Sur',LB:'Líbano',LU:'Luxemburgo',MA:'Marruecos',MX:'México',NL:'Países Bajos',PA:'Panamá',PE:'Perú',PH:'Filipinas',PL:'Polonia',PR:'Puerto Rico',PT:'Portugal',RO:'Rumanía',SA:'Arabia Saudita',SG:'Singapur',SV:'El Salvador',TN:'Túnez',TR:'Turquía',TW:'Taiwán',US:'Estados Unidos',VE:'Venezuela',VN:'Vietnam',CAM:'América Central',CBR:'Caledonbria',MEN:'Oriente Medio y Norte de África',EEU:'Europa del Este',ASIA:'Asia',HKT:'Hong Kong - Taiwán',GCO:'Gran Colombia',DZ:'Argelia',BA:'Bosnia y Herzegovina',RS:'Serbia'},
  ja:{AE:'アラブ首長国連邦',AL:'アルバニア',AT:'オーストリア',AU:'オーストラリア',BE:'ベルギー',BG:'ブルガリア',BR:'ブラジル',CA:'カナダ',CH:'スイス',CL:'チリ',CO:'コロンビア',CR:'コスタリカ',DE:'ドイツ',DO:'ドミニカ共和国',EC:'エクアドル',EE:'エストニア',EG:'エジプト',ES:'スペイン',FR:'フランス',GB:'イギリス',GR:'ギリシャ',GT:'グアテマラ',HK:'香港',HN:'ホンジュラス',HU:'ハンガリー',ID:'インドネシア',IE:'アイルランド',IN:'インド',IT:'イタリア',JO:'ヨルダン',JP:'日本',KR:'韓国',LB:'レバノン',LU:'ルクセンブルク',MA:'モロッコ',MX:'メキシコ',NL:'オランダ',PA:'パナマ',PE:'ペルー',PH:'フィリピン',PL:'ポーランド',PR:'プエルトリコ',PT:'ポルトガル',RO:'ルーマニア',SA:'サウジアラビア',SG:'シンガポール',SV:'エルサルバドル',TN:'チュニジア',TR:'トルコ',TW:'台湾',US:'アメリカ合衆国',VE:'ベネズエラ',VN:'ベトナム',CAM:'中央アメリカ',CBR:'カレドンブリア',MEN:'中東・北アフリカ',EEU:'東ヨーロッパ',ASIA:'アジア',HKT:'香港・台湾',GCO:'グランコロンビア',DZ:'アルジェリア',BA:'ボスニア・ヘルツェゴビナ',RS:'セルビア'},
};
function natName(code){ return (NAT_NAMES[LANG] && NAT_NAMES[LANG][code]) || NAT_NAMES.fr[code] || code; }

/* =========================================================
   STATE
========================================================= */
let STATE = {
  quali:{}, mid:{}, top:{},
  bracket:{ slots:Array(16).fill(null), scores:{r0:{},r1:{},r2:{},r3:{}}, players:{r0:{},r1:{},r2:{},r3:{}} }
};

function defaultState(){
  const s = {quali:{},mid:{},top:{},bracket:{slots:Array(16).fill(null),scores:{r0:{},r1:{},r2:{},r3:{}},players:{r0:{},r1:{},r2:{},r3:{}}}};
  for(const g in QUALI_GROUPS) s.quali[g] = {slots:[...QUALI_GROUPS[g].teams], scores:{}, players:{}};
  for(const g in MID_GROUPS) s.mid[g] = {slots:[...MID_GROUPS[g].fixed, null, null], scores:{}, players:{}};
  for(const g in TOP_GROUPS) s.top[g] = {slots:[...TOP_GROUPS[g].teams], scores:{}, players:{}};
  return s;
}
function emptyPlayerSlots(){ return [0,1,2,3,4,5].map(()=>({n:'', races: Array(12).fill('')})); }
function playerTotal(p){ return (p.races||[]).reduce((sum,v)=> sum + (v!=='' && v!=null ? (Number(v)||0) : 0), 0); }
function playerRacesFilled(p){ return (p.races||[]).some(v=>v!=='' && v!=null); }
// A player can be substituted mid-match (e.g. connection issue). subFromRace is 1-indexed:
// races before it belong to the original player (p.n), races from it onward belong to p.subName.
function raceOwnerName(p, raceIdx){
  if(p.subName && p.subFromRace && (raceIdx+1) >= Number(p.subFromRace)) return p.subName;
  return p.n;
}
// Splits a slot into one or two "segments" (original player, and substitute if any), each with
// their own name and the subset of the 12 races that belongs to them. Used everywhere stats need
// to credit the right person instead of assuming one name covers the whole match.
function playerSegments(p){
  if(!p || !p.n) return [];
  const races = p.races || Array(12).fill('');
  if(!p.subName || !p.subFromRace){
    return [{ name: p.n, races, raceIndices: races.map((_,i)=>i) }];
  }
  const cut = Math.max(1, Math.min(12, Number(p.subFromRace))) - 1; // 0-indexed cutoff
  const beforeIdx = [], afterIdx = [];
  races.forEach((_,i)=> (i<cut ? beforeIdx : afterIdx).push(i));
  const segs = [];
  if(beforeIdx.length) segs.push({ name: p.n, races: beforeIdx.map(i=>races[i]), raceIndices: beforeIdx });
  if(afterIdx.length) segs.push({ name: p.subName, races: afterIdx.map(i=>races[i]), raceIndices: afterIdx });
  return segs;
}

const TRACKS = [
  {id:'t1_mario_bros_circuit', fr:'Circuit Mario Bros.', en:'Mario Bros. Circuit', es:'Circuito Mario Bros.', ja:'マリオブラザーズサーキット'},
  {id:'t2_crown_city', fr:'Trophéopolis', en:'Crown City', es:'Ciudad Corona', ja:'トロフィーシティ'},
  {id:'t3_whistlestop_summit', fr:'Mont Tchou Tchou', en:'Whistlestop Summit', es:'Cañón Ferroviario', ja:'シュポポコースター'},
  {id:'t4_dk_spaceport', fr:'Spatioport DK', en:'DK Spaceport', es:'Puerto Espacial DK', ja:'DKうちゅうセンター'},
  {id:'t5_desert_hills', fr:'Désert du soleil', en:'Desert Hills', es:'Desierto Sol-Sol', ja:'サンサンさばく'},
  {id:'t6_shy_guy_bazaar', fr:'Souk Maskass', en:'Shy Guy Bazaar', es:'Bazar Shy Guy', ja:'ヘイホーカーニバル'},
  {id:'t7_wario_stadium', fr:'Stade Wario', en:'Wario Stadium', es:'Estadio Wario', ja:'ワリオスタジアム'},
  {id:'t8_airship_fortress', fr:'Bateau volant', en:'Airship Fortress', es:'Fortaleza Aérea', ja:'キラーシップ'},
  {id:'t9_dk_pass', fr:'Alpes DK', en:'DK Pass', es:'DK Alpino', ja:'DKスノーマウンテン'},
  {id:'t10_starview_peak', fr:'Pic de l\'observatoire', en:'Starview Peak', es:'Mirador Estelar', ja:'ロゼッタてんもんだい'},
  {id:'t11_sky_high_sundae', fr:'Cité Sorbet', en:'Sky-High Sundae', es:'Cielos Helados', ja:'アイスビルディング'},
  {id:'t12_wario_s_galleon', fr:'Galion de Wario', en:'Wario\'s Galleon', es:'Galeón de Wario', ja:'ワリオシップ'},
  {id:'t13_koopa_troopa_beach', fr:'Plage Koopa', en:'Koopa Troopa Beach', es:'Playa Koopa', ja:'ノコノコビーチ'},
  {id:'t14_faraway_oasis', fr:'Savane sauvage', en:'Faraway Oasis', es:'Sabana Salpicante', ja:'リバーサイドサファリ'},
  {id:'t15_peach_stadium', fr:'Stade Peach', en:'Peach Stadium', es:'Estadio Peach', ja:'ピーチスタジアム'},
  {id:'t16_peach_beach', fr:'Plage Peach', en:'Peach Beach', es:'Playa Peach', ja:'ピーチビーチ'},
  {id:'t17_salty_salty_speedway', fr:'Cité Fleur-de-sel', en:'Salty Salty Speedway', es:'Ciudad Salina', ja:'ソルティータウン'},
  {id:'t18_dino_dino_jungle', fr:'Jungle Dino Dino', en:'Dino Dino Jungle', es:'Jungla Dino Dino', ja:'ディノディノジャングル'},
  {id:'t19_great_block_ruins', fr:'Bloc ? antique', en:'Great ? Block Ruins', es:'Templo del Bloque ?', ja:'ハテナしんでん'},
  {id:'t20_cheep_cheep_falls', fr:'Chutes Cheep Cheep', en:'Cheep Cheep Falls', es:'Cascadas Cheep Cheep', ja:'プクプクフォールズ'},
  {id:'t21_dandelion_depths', fr:'Gouffre Pissenlit', en:'Dandelion Depths', es:'Gruta Diente de León', ja:'ショーニューロード'},
  {id:'t22_boo_cinema', fr:'Cinéma Boo', en:'Boo Cinema', es:'Cine Boo', ja:'おばけシネマ'},
  {id:'t23_dry_bones_burnout', fr:'Fournaise osseuse', en:'Dry Bones Burnout', es:'Caverna Ósea', ja:'ホネホネツイスター'},
  {id:'t24_moo_moo_meadows', fr:'Prairie Meuh Meuh', en:'Moo Moo Meadows', es:'Pradera Mu-Mu', ja:'モーモーカントリー'},
  {id:'t25_choco_mountain', fr:'Montagne Choco', en:'Choco Mountain', es:'Monte Chocolate', ja:'チョコマウンテン'},
  {id:'t26_toad_s_factory', fr:'Usine Toad', en:'Toad\'s Factory', es:'Fábrica de Toad', ja:'キノピオファクトリー'},
  {id:'t27_bowser_s_castle', fr:'Chateau de Bowser', en:'Bowser\'s Castle', es:'Castillo de Bowser', ja:'クッパキャッスル'},
  {id:'t28_acorn_heights', fr:'Chemin du chêne', en:'Acorn Heights', es:'Aldea Arbórea', ja:'どんぐりツリーハウス'},
  {id:'t29_mario_circuit', fr:'Circuit Mario', en:'Mario Circuit', es:'Circuito Mario', ja:'マリオサーキット'},
  {id:'t30_rainbow_road', fr:'Route Arc-en-ciel', en:'Rainbow Road', es:'Senda Arco Iris', ja:'レインボーロード'},
];

function trackName(id){ if(!id) return ''; const tr = TRACKS.find(t=>t.id===id); return tr ? tr[LANG] : id; }
function emptyMatchPlayers(){ return {h:emptyPlayerSlots(), a:emptyPlayerSlots(), tracks: Array(12).fill('')}; }
function migratePlayerSlot(slot){
  // Older matches encoded before the 12-race system only stored a single total score
  // ({n, s}) per player. Give any such slot a proper races array so the admin form can
  // safely write into it — the old total is kept as race 1 rather than being discarded.
  if(!slot || Array.isArray(slot.races)) return slot;
  const legacyScore = slot.s;
  slot.races = Array(12).fill('');
  if(legacyScore !== undefined && legacyScore !== '' && legacyScore != null) slot.races[0] = legacyScore;
  delete slot.s;
  return slot;
}
function migrateMatchPlayers(pl){
  if(!pl) return pl;
  if(pl.h) pl.h.forEach(migratePlayerSlot);
  if(pl.a) pl.a.forEach(migratePlayerSlot);
  if(!Array.isArray(pl.tracks)) pl.tracks = Array(12).fill('');
  return pl;
}
function migrateAllPlayerData(){
  function migrateGroup(groupsObj){
    for(const id in groupsObj){
      const g = groupsObj[id];
      if(g.players) for(const key in g.players) migrateMatchPlayers(g.players[key]);
    }
  }
  migrateGroup(STATE.quali); migrateGroup(STATE.top); migrateGroup(STATE.mid);
  for(const rk of ['r0','r1','r2','r3']){
    const pls = STATE.bracket.players && STATE.bracket.players[rk];
    if(pls) for(const m in pls) migrateMatchPlayers(pls[m]);
  }
}

/* =========================================================
   STATS DATA LOADING (Supabase, read-only)
   Scores/results are fetched live from the same Supabase "site_data" table
   the admin app (index.html) writes to, using its public anon key (read-only
   here — this page never writes). assets/data.js (window.MKWC_DATA) is kept
   only as a fallback snapshot: used if the Supabase fetch fails, or when the
   site is opened directly via file:// (fetch can't hit Supabase from there).
   Flags are NOT part of this — they stay static PNGs, see FLAG RENDER below.
========================================================= */
const SUPABASE_URL = 'https://iegkufvmpnwpwabbljte.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_0b95MOYv1hzwUi8uiUdLyA_OJempZOf';
const SB_TABLE = `${SUPABASE_URL}/rest/v1/site_data`;
const SB_HEADERS = {
  'apikey': SUPABASE_ANON_KEY,
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json',
};
async function fetchRemoteState(){
  const res = await fetch(`${SB_TABLE}?key=eq.mkwc_state&select=value`, { headers: SB_HEADERS });
  if(!res.ok) throw new Error('Supabase get failed: '+res.status);
  const rows = await res.json();
  return rows.length ? JSON.parse(rows[0].value) : null;
}
async function loadState(){
  let parsed = null;
  try{ parsed = await fetchRemoteState(); }catch(e){ parsed = null; }
  if(!parsed) parsed = window.MKWC_DATA || null;
  try{
    if(parsed){
      const d = defaultState();
      STATE = Object.assign(d, parsed);
      for(const k of ['quali','mid','top']){
        for(const g in d[k]){
          if(!STATE[k][g]) STATE[k][g] = d[k][g];
          if(!STATE[k][g].players) STATE[k][g].players = {};
        }
      }
      if(!STATE.bracket) STATE.bracket = d.bracket;
      if(!STATE.bracket.players) STATE.bracket.players = {r0:{},r1:{},r2:{},r3:{}};
    } else { STATE = defaultState(); }
  }catch(e){ STATE = defaultState(); }
}

/* =========================================================
   FLAG RENDER
   Flags are plain PNG files under flags/<TAG>.png (generated once from the
   old flags.json SVG data) — no more client-side SVG building/rasterizing.
========================================================= */
function flagEl(tag, cls){
  return `<span class="flag ${cls||''}" title="${teamName(tag)||''}"><img src="flags/${tag}.png" alt="" loading="lazy"></span>`;
}
function tbdEl(){ return `<span class="tbd"></span>`; }
function teamLinkHTML(tag, cls){ return `<span class="team-link" data-team="${tag}">${flagEl(tag,cls)}<span class="teamname">${teamName(tag)}</span></span>`; }
function teamPlainHTML(tag, cls){ return `<span class="team-plain">${flagEl(tag,cls)}<span class="teamname">${teamName(tag)}</span></span>`; }
/* =========================================================
   STANDINGS CALC
========================================================= */
function computeStandings(slots, scores){
  const rows = slots.map(t=>({tag:t, w:0,l:0,d:0,pf:0,pa:0}));
  pairsFor(slots.length).forEach(([i,j])=>{
    const key = i+'-'+j;
    const sc = scores[key];
    if(!sc || slots[i]==null || slots[j]==null) return;
    const [h,a] = sc;
    if(h===''||a===''||h==null||a==null) return;
    const hh=Number(h), aa=Number(a);
    rows[i].pf+=hh; rows[i].pa+=aa;
    rows[j].pf+=aa; rows[j].pa+=hh;
    if(hh>aa){ rows[i].w++; rows[j].l++; } else if(aa>hh){ rows[j].w++; rows[i].l++; } else { rows[i].d++; rows[j].d++; }
  });
  const sorted = rows.map((r,idx)=>({...r, diff:r.pf-r.pa, slotIdx:idx}))
    .sort((a,b)=> b.w-a.w || b.diff-a.diff || b.pf-a.pf || projectedRank(a.tag)-projectedRank(b.tag));
  const leader = sorted.find(r=>r.tag!=null);
  sorted.forEach(r=>{
    r.gb = (leader && r.tag!=null) ? ((leader.w - r.w) + (r.l - leader.l)) / 2 : null;
  });
  return sorted;
}

/* =========================================================
   RENDER: STANDINGS VIEW
========================================================= */
function isGroupFullyPlayed(groupObj){
  return pairsFor(groupObj.slots.length).every(([i,j])=>{
    const h = groupObj.slots[i], a = groupObj.slots[j];
    if(h==null || a==null) return false; // team not decided yet — group can't be complete
    const sc = groupObj.scores[i+'-'+j];
    return sc && sc[0]!=='' && sc[1]!=='' && sc[0]!=null && sc[1]!=null;
  });
}
function renderGroupCard(title, groupObj, qualifyCount, hint, anchorId){
  const standings = computeStandings(groupObj.slots, groupObj.scores);
  const anyPlayed = isGroupFullyPlayed(groupObj);
  let rows = '';
  standings.forEach((r,i)=>{
    const isQ = anyPlayed && i < qualifyCount && r.tag!=null;
    const posClass = i===0 ? 'pos p1' : 'pos';
    rows += `<tr class="${isQ?'qualified':''}">
      <td class="${posClass}">P${i+1}</td>
      <td><div class="teamcell">${r.tag? teamLinkHTML(r.tag) : tbdEl()+`<span class="tbdname">${t('tbd')}</span>`}</div></td>
      <td class="num">${r.w}</td>
      <td class="num">${r.d}</td>
      <td class="num">${r.l}</td>
      <td class="num">${r.gb==null?'—':(r.gb===0?'—':r.gb)}</td>
      <td class="num">${r.diff>0?'+':''}${r.diff}</td>
    </tr>`;
  });
  return `<div class="group-card"${anchorId?` id="${anchorId}"`:''}>
    <h3>${title} <span class="qual-tag">${hint||''}</span></h3>
    <div style="overflow-x:auto;">
    <table class="standings">
      <thead><tr><th></th><th>${t('colTeam')}</th><th class="num">${t('colW')}</th><th class="num">${t('colD')}</th><th class="num">${t('colL')}</th><th class="num">${t('colGB')}</th><th class="num">${t('colDiff')}</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    </div>
  </div>`;
}

function deriveBracketRounds(){
  const rounds = [STATE.bracket.slots.slice()];
  const roundScores = [STATE.bracket.scores.r0, STATE.bracket.scores.r1, STATE.bracket.scores.r2, STATE.bracket.scores.r3];
  for(let r=0;r<3;r++){
    const prev = rounds[r]; const next=[];
    for(let m=0;m<prev.length/2;m++){
      const h=prev[m*2], a=prev[m*2+1]; const sc=roundScores[r][m];
      let winner=null;
      if(sc && h!=null && a!=null && sc[0]!=='' && sc[1]!=='' && sc[0]!=null && sc[1]!=null){
        winner = Number(sc[0])>Number(sc[1]) ? h : (Number(sc[1])>Number(sc[0]) ? a : null);
      }
      next.push(winner);
    }
    rounds.push(next);
  }
  return {rounds, roundScores};
}

/* =========================================================
   MATCH DETAIL
========================================================= */
function parseMatchRef(ref){
  if(!ref) return null;
  const parts = ref.split('|');
  if(parts[0]==='g'){
    const anchorPrefix = parts[1], id = parts[2];
    const i = Number(parts[3]), j = Number(parts[4]);
    const groupsObj = anchorPrefix==='quali' ? STATE.quali : (anchorPrefix==='top' ? STATE.top : STATE.mid);
    const g = groupsObj && groupsObj[id];
    if(!g) return null;
    const h = g.slots[i], a = g.slots[j];
    const key = i+'-'+j;
    const sc = g.scores[key] || ['',''];
    const pl = g.players[key] || emptyMatchPlayers();
    const stageLabel = anchorPrefix==='quali' ? t('stageQuali') : t('stagePhaseGroupes');
    const iso = scheduledTimeFor(anchorPrefix, id, key);
    const dateStr = iso ? formatScheduledLocal(iso) : (anchorPrefix==='quali' ? t('dateQuali') : t('datePhase'));
    return {h, a, sc, players:pl, stage:`${stageLabel} · Gr. ${id}`, date:dateStr, anchor:`group-${anchorPrefix}-${id}`, rawIso: iso||null};
  } else if(parts[0]==='b'){
    const round = Number(parts[1]), idx = Number(parts[2]);
    const {rounds, roundScores} = deriveBracketRounds();
    const slots = rounds[round];
    if(!slots) return null;
    const h = slots[idx*2], a = slots[idx*2+1];
    const sc = roundScores[round][idx] || ['',''];
    const pl = (STATE.bracket.players['r'+round]||{})[idx] || emptyMatchPlayers();
    return {h, a, sc, players:pl, stage:`${t('stageBracket')} · ${ROUND_NAMES_F()[round]}`, date:ROUND_DATES_F()[round], anchor:null, rawIso:null};
  }
  return null;
}

function raceDetailTableHTML(playersH, playersA, teamH, teamA, tracks){
  if(!tracks) return '';
  const rows = [];
  for(let r=0;r<12;r++){
    const anyEntered = [...playersH,...playersA].some(p=> p.n && p.races && p.races[r]!=='' && p.races[r]!=null);
    if(!anyEntered) continue;
    const scH = playersH.reduce((s,p)=> s + (p.n && p.races[r]!=='' && p.races[r]!=null ? (Number(p.races[r])||0) : 0), 0);
    const scA = playersA.reduce((s,p)=> s + (p.n && p.races[r]!=='' && p.races[r]!=null ? (Number(p.races[r])||0) : 0), 0);
    rows.push({r, track:tracks[r], scH, scA});
  }
  if(!rows.length) return '';
  return `<div class="stats-table-wrap" style="margin-top:20px;">
    <table class="stats-table">
      <thead><tr><th>${t('colRace')}</th><th>${t('colTrack')}</th><th class="num">${teamName(teamH)}</th><th class="num">${teamName(teamA)}</th></tr></thead>
      <tbody>
        ${rows.map(row=>`<tr>
          <td class="lname">R${row.r+1}</td>
          <td class="lteam">${row.track?trackName(row.track):'—'}</td>
          <td class="num ${row.scH>row.scA?'score-win':''}">${row.scH}</td>
          <td class="num ${row.scA>row.scH?'score-win':''}">${row.scA}</td>
        </tr>`).join('')}
      </tbody>
    </table>
  </div>`;
}
function raceProgressChartHTML(playersH, playersA, teamH, teamA){
  // Cumulative team score after each race, race by race — only up to the last race with any data entered.
  let lastRace = -1;
  for(let r=0;r<12;r++){
    const anyEntered = [...playersH,...playersA].some(p=> p.n && p.races && p.races[r]!=='' && p.races[r]!=null);
    if(anyEntered) lastRace = r;
  }
  if(lastRace < 0) return '';
  const cumH = [], cumA = [];
  let runH=0, runA=0;
  for(let r=0;r<=lastRace;r++){
    runH += playersH.reduce((s,p)=> s + (p.n && p.races[r]!=='' && p.races[r]!=null ? (Number(p.races[r])||0) : 0), 0);
    runA += playersA.reduce((s,p)=> s + (p.n && p.races[r]!=='' && p.races[r]!=null ? (Number(p.races[r])||0) : 0), 0);
    cumH.push(runH); cumA.push(runA);
  }
  const w=560, h=220, padL=40, padR=16, padT=16, padB=30;
  const n = cumH.length;
  const maxVal = Math.max(1, ...cumH, ...cumA);
  const x = i => n>1 ? padL + (i/(n-1))*(w-padL-padR) : padL;
  const y = v => padT + (1 - v/maxVal) * (h-padT-padB);
  const pathFor = arr => arr.map((v,i)=> `${i===0?'M':'L'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
  const gridLines = [0,0.25,0.5,0.75,1].map(f=>{
    const yy = padT + f*(h-padT-padB);
    const val = Math.round(maxVal*(1-f));
    return `<line x1="${padL}" y1="${yy}" x2="${w-padR}" y2="${yy}" stroke="rgba(255,235,210,0.12)" stroke-width="1"/>
      <text x="${padL-8}" y="${yy+4}" text-anchor="end" font-size="10" fill="#D9B996" font-family="JetBrains Mono, monospace">${val}</text>`;
  }).join('');
  const xLabels = cumH.map((_,i)=> `<text x="${x(i).toFixed(1)}" y="${h-padB+16}" text-anchor="middle" font-size="10" fill="#D9B996" font-family="JetBrains Mono, monospace">${i+1}</text>`).join('');
  return `<div class="race-chart-wrap">
    <h3 class="race-chart-title">${t('raceChartTitle')}</h3>
    <svg viewBox="0 0 ${w} ${h}" style="width:100%;max-width:${w}px;display:block;">
      ${gridLines}
      ${xLabels}
      <path d="${pathFor(cumH)}" fill="none" stroke="#FFCE54" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>
      <path d="${pathFor(cumA)}" fill="none" stroke="#8FA8D9" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>
      ${cumH.map((v,i)=>`<circle cx="${x(i).toFixed(1)}" cy="${y(v).toFixed(1)}" r="3" fill="#FFCE54"/>`).join('')}
      ${cumA.map((v,i)=>`<circle cx="${x(i).toFixed(1)}" cy="${y(v).toFixed(1)}" r="3" fill="#8FA8D9"/>`).join('')}
    </svg>
    <div class="race-chart-legend">
      <span><span class="dot" style="background:#FFCE54;"></span>${teamName(teamH)}</span>
      <span><span class="dot" style="background:#8FA8D9;"></span>${teamName(teamA)}</span>
    </div>
  </div>`;
}
function playerListHTML(entries, teamTag){
  const filled = entries.filter(p=>p.n);
  if(!filled.length) return '';
  const rows = [];
  filled.forEach(p=>{
    playerSegments(p).forEach((seg, idx)=>{
      const segScore = seg.races.reduce((s,v)=> s + (v!=='' && v!=null ? Number(v) : 0), 0);
      const hasData = seg.races.some(v=>v!=='' && v!=null);
      rows.push({ name: seg.name, score: segScore, hasData, isSub: idx>0 });
    });
  });
  rows.sort((a,b)=> b.score-a.score);
  return `<div class="stats-table-wrap">
    <table class="stats-table">
      <thead><tr><th colspan="2">${teamPlainHTML(teamTag)}</th></tr></thead>
      <tbody>
        ${rows.map(r=>`<tr><td class="lname">${r.name}${r.isSub?` <span class="sub-tag">(${t('subTag')})</span>`:''}</td><td class="num highlight">${r.hasData?r.score:'—'}</td></tr>`).join('')}
      </tbody>
    </table>
  </div>`;
}
function renderMatchDetail(ref){
  const el = document.getElementById('view-match');
  const md = parseMatchRef(ref);
  if(!md){
    el.innerHTML = `<button class="back-btn" id="backToCalBtn">${backLabel()}</button>`;
    wireMatchDetailEvents();
    return;
  }
  const {h, a, sc, players, stage, date, anchor, rawIso} = md;
  const played = sc && sc[0]!=='' && sc[1]!=='' && sc[0]!=null && sc[1]!=null;
  const hWin = played && Number(sc[0])>Number(sc[1]);
  const aWin = played && Number(sc[1])>Number(sc[0]);
  const isLiveNow = isCurrentlyLive(rawIso, sc);
  el.innerHTML = `
    <button class="back-btn" id="backToCalBtn">${backLabel()}</button>
    <div class="team-detail-page">
      ${isLiveNow ? `<a href="https://www.twitch.tv/mariokartcentral" target="_blank" rel="noopener noreferrer" class="twitch-live-banner">🔴 ${t('watchLiveTwitch')}</a>` : ''}
      <div class="helptext" style="margin-bottom:18px;">
        <span class="${anchor?'stage-link':''}"${anchor?` data-anchor="${anchor}"`:''}>${stage}</span> · ${date}
      </div>
      <div class="match-detail-row">
        <div class="match-detail-team ${hWin?'winner':''}">
          ${h? teamLinkHTML(h,'lg') : `${tbdEl()}<span class="tbdname">${t('tbd')}</span>`}
        </div>
        <div class="match-detail-score">${played? (sc[0]+' – '+sc[1]) : `<span class="md-vs">${t('vs')}</span><div class="md-upcoming-date">${date}</div>`}</div>
        <div class="match-detail-team ${aWin?'winner':''}">
          ${a? teamLinkHTML(a,'lg') : `${tbdEl()}<span class="tbdname">${t('tbd')}</span>`}
        </div>
      </div>
      ${(players.h.some(p=>p.n) || players.a.some(p=>p.n)) ? `<div class="match-detail-players-row">
        <div class="mdp-col">${playerListHTML(players.h, h)}</div>
        <div class="mdp-col">${playerListHTML(players.a, a)}</div>
      </div>
      ${raceProgressChartHTML(players.h, players.a, h, a)}
      ${raceDetailTableHTML(players.h, players.a, h, a, players.tracks)}` : ''}
    </div>
  `;
  wireMatchDetailEvents();
}
function wireMatchDetailEvents(){
  const btn = document.getElementById('backToCalBtn');
  if(btn) btn.onclick = goBack;
}

function renderBracket(){
  const {rounds, roundScores} = deriveBracketRounds();
  let html = `<div class="bracket-wrap"><div class="bracket">`;
  for(let r=0;r<4;r++){
    html += `<div class="round"><div class="round-title">${ROUND_NAMES_F()[r]}<br><span>${ROUND_DATES_F()[r]}</span></div>`;
    const slots = rounds[r];
    const nMatches = slots.length/2;
    for(let m=0;m<nMatches;m++){
      const h = slots[m*2], a = slots[m*2+1];
      const sc = roundScores[r][m] || ['',''];
      const hWin = sc[0]!==''&&sc[1]!==''&&Number(sc[0])>Number(sc[1]);
      const aWin = sc[0]!==''&&sc[1]!==''&&Number(sc[1])>Number(sc[0]);
      html += `<div class="match${(h&&a)?' match-card':''}"${(h&&a)?` data-matchref="b|${r}|${m}"`:''}>
        <div class="mrow ${hWin?'winner':''}"><span>${h? teamPlainHTML(h):tbdEl()+`<span class="tbdname">${t('tbd')}</span>`}</span><span class="score">${sc[0]!==''&&sc[0]!=null?sc[0]:'—'}</span></div>
        <div class="mrow ${aWin?'winner':''}"><span>${a? teamPlainHTML(a):tbdEl()+`<span class="tbdname">${t('tbd')}</span>`}</span><span class="score">${sc[1]!==''&&sc[1]!=null?sc[1]:'—'}</span></div>
      </div>`;
    }
    html += `</div>`;
  }
  html += `</div></div>`;
  return html;
}

function renderStandingsView(){
  const el = document.getElementById('view-standings');
  let html = '';

  html += `<div class="stage-block">
    <div class="stage-head"><h2 class="outline">${t('stageQuali')}</h2><span class="stage-date">${t('dateQualiFull')}</span></div>
    <div class="tier-badge">${t('tierQuali')}</div>
    <div class="stage-note">${t('noteQuali')}</div>
    <div class="groups-grid">
      ${Object.entries(QUALI_GROUPS).map(([id,g])=>renderGroupCard(t('group')+' '+id, STATE.quali[id], 2, null, 'group-quali-'+id)).join('')}
    </div>
  </div>`;

  html += `<div class="stage-block">
    <div class="stage-head"><h2 class="outline">${t('stagePhaseGroupes')}</h2><span class="stage-date">${t('datePhaseFull')}</span></div>
    <div class="stage-subhead">${t('subhead14')}</div>
    <div class="tier-badge">${t('tier14')}</div>
    <div class="stage-note">${t('note14')}</div>
    <div class="groups-grid">
      ${Object.entries(MID_GROUPS).map(([id,g])=>renderGroupCard(t('group')+' '+id, STATE.mid[id], 2, null, 'group-mid-'+id)).join('')}
    </div>
    <div class="stage-subhead">${t('subheadAB')}</div>
    <div class="tier-badge">${t('tierAB')}</div>
    <div class="stage-note">${t('noteAB')}</div>
    <div class="groups-grid">
      ${Object.entries(TOP_GROUPS).map(([id,g])=>renderGroupCard(t('group')+' '+id, STATE.top[id], 4, null, 'group-top-'+id)).join('')}
    </div>
  </div>`;

  html += `<div class="stage-block">
    <div class="stage-head"><h2 class="outline">${t('stageBracket')}</h2><span class="stage-date">${t('dateBracketFull')}</span></div>
    <div class="stage-note">${t('noteBracket')}</div>
    ${renderBracket()}
  </div>`;

  el.innerHTML = html;
}

/* =========================================================
   RENDER: CALENDAR VIEW
========================================================= */
function getTotalMatchCount(){
  let total = 0;
  Object.values(QUALI_GROUPS).forEach(g => { total += pairsFor(g.teams.length).length; });
  Object.keys(MID_GROUPS).forEach(() => { total += pairsFor(4).length; });
  Object.values(TOP_GROUPS).forEach(g => { total += pairsFor(g.teams.length).length; });
  total += 15; // bracket: 8 + 4 + 2 + 1
  return total;
}
function getAllMatchItems(){
  const items = [];
  function pushGroupMatches(groupsObj, stageLabel, dateStr, anchorPrefix, idsOrder, dateKey, dateOrder){
    idsOrder.forEach((id)=>{
      const g = groupsObj[id];
      if(!g) return;
      pairsFor(g.slots.length).forEach(([i,j])=>{
        const h=g.slots[i], a=g.slots[j];
        if(h==null || a==null) return;
        const key = i+'-'+j;
        const sc = g.scores[key];
        const iso = scheduledTimeFor(anchorPrefix, id, key);
        let itemDate = dateStr, itemDayLabel = dateStr, itemDateKey = dateKey, itemDateOrder = dateOrder * 1e10;
        if(iso){
          itemDate = formatScheduledLocal(iso);
          itemDayLabel = formatScheduledLocalDateOnly(iso);
          itemDateKey = localDateKey(iso); // one bucket per exact calendar day, in the visitor's own reading of the ISO date
          itemDateOrder = dateOrder * 1e10 + Math.floor(new Date(iso).getTime()/1000);
        }
        items.push({
          stage:`${stageLabel} · Gr. ${id}`, date:itemDate, dayLabel:itemDayLabel, h,a, sc,
          anchor:`group-${anchorPrefix}-${id}`, matchRef:`g|${anchorPrefix}|${id}|${i}|${j}`,
          dateKey:itemDateKey, dateOrder:itemDateOrder, rawIso: iso || null
        });
      });
    });
  }
  pushGroupMatches(STATE.quali, t('stageQuali'), t('dateQuali'), 'quali', ['W','X','Y','Z'], 'quali', 0);
  pushGroupMatches(STATE.mid, t('stagePhaseGroupes'), t('datePhase'), 'mid', ['1','2','3','4'], 'groupstage', 1);
  pushGroupMatches(STATE.top, t('stagePhaseGroupes'), t('datePhase'), 'top', ['A','B'], 'groupstage', 1);

  const {rounds, roundScores} = deriveBracketRounds();
  for(let r=0;r<4;r++){
    const slots = rounds[r];
    for(let m=0;m<slots.length/2;m++){
      const h=slots[m*2], a=slots[m*2+1];
      if(h==null||a==null) continue;
      items.push({
        stage:`${t('stageBracket')} · ${ROUND_NAMES_F()[r]}`, date:ROUND_DATES_F()[r], dayLabel:ROUND_DATES_F()[r], h, a, sc:roundScores[r][m],
        matchRef:`b|${r}|${m}`, anchor:null,
        dateKey:`bracket-${r}`, dateOrder: (2+r) * 1e10
      });
    }
  }
  return items;
}
function isPlayed(sc){ return sc && sc[0]!=='' && sc[1]!=='' && sc[0]!=null && sc[1]!=null; }
function matchCardHTML(it){
  const played = isPlayed(it.sc);
  let scoreHTML = '';
  if(played){
    const hWin = Number(it.sc[0])>Number(it.sc[1]);
    const aWin = Number(it.sc[1])>Number(it.sc[0]);
    scoreHTML = `<span class="${hWin?'score-win':'score-lose'}">${it.sc[0]}</span> – <span class="${aWin?'score-win':'score-lose'}">${it.sc[1]}</span>`;
  }
  return `<div class="cal-item match-card" data-matchref="${it.matchRef}">
    <span class="cal-stage">${it.stage}</span>
    <span class="cal-teams">${teamPlainHTML(it.h)} <span class="vs">${t('vs')}</span> ${teamPlainHTML(it.a)}</span>
    <span class="cal-score ${played?'done':''}">${scoreHTML}</span>
    <span class="cal-date${played?'':' emphasize'}">${it.date}</span>
  </div>`;
}

const MATCH_DURATION_MS = 60 * 60 * 1000; // a war/set is assumed to last about an hour
function isCurrentlyLive(rawIso, sc){
  if(!rawIso || isPlayed(sc)) return false;
  const start = new Date(rawIso).getTime();
  const now = Date.now();
  return start <= now && (now - start) < MATCH_DURATION_MS;
}
function getLiveMatchesNow(){
  return getAllMatchItems().filter(it => isCurrentlyLive(it.rawIso, it.sc));
}
function getPlayInStartMs(){
  return Math.min(...Object.values(SCHEDULED_TIMES).map(iso=>new Date(iso).getTime()));
}
function getTournamentPhaseStatus(){
  const now = new Date();
  const dOnly = (y,m,d)=> new Date(y,m-1,d).getTime();
  const today = dOnly(now.getFullYear(), now.getMonth()+1, now.getDate());
  const playInEnd=dOnly(2026,7,13);
  const groupStart=dOnly(2026,7,17), groupEnd=dOnly(2026,7,20);
  const bracketStart=dOnly(2026,7,24), bracketEnd=dOnly(2026,8,3);
  if(now.getTime() < getPlayInStartMs()) return {phase:'before', key:'homeStatusBefore'};
  if(today < playInEnd) return {phase:'playin', key:'homeStatusPlayin'};
  if(today < groupStart) return {phase:'between1', key:'homeStatusBetween1'};
  if(today < groupEnd) return {phase:'group', key:'homeStatusGroup'};
  if(today < bracketStart) return {phase:'between2', key:'homeStatusBetween2'};
  if(today < bracketEnd) return {phase:'bracket', key:'homeStatusBracket'};
  return {phase:'after', key:'homeStatusAfter'};
}

function renderHomeView(){
  const el = document.getElementById('view-home');
  const items = getAllMatchItems().sort((a,b)=>a.dateOrder-b.dateOrder);
  const upcoming = items.filter(it=>!isPlayed(it.sc)).slice(0,6);
  const recent = items.filter(it=>isPlayed(it.sc)).slice(-5).reverse();
  const matchesPlayed = items.filter(it=>isPlayed(it.sc)).length;
  const totalMatches = getTotalMatchCount();
  const pct = totalMatches ? Math.round((matchesPlayed/totalMatches)*100) : 0;
  const status = getTournamentPhaseStatus();
  const liveNow = status.phase!=='before' ? getLiveMatchesNow() : [];

  let html = `
    <div class="phase-banner phase-${status.phase}">${t(status.key)}${status.phase==='before' ? `<div id="playinCountdown" class="phase-countdown"></div>` : ''}</div>
    ${liveNow.length ? `<div class="live-now-block">
      <h3 class="live-now-title">${t('homeLiveNow')}</h3>
      <div class="cal-list">${liveNow.map(matchCardHTML).join('')}</div>
    </div>` : ''}
    <div class="stage-note" style="font-size:15px;margin:18px 0 24px;">${t('homeIntro')}</div>

    <div class="match-progress" style="margin-bottom:30px;">
      <div class="match-progress-label">${t('homeFactMatches')} <b>${matchesPlayed} / ${totalMatches}</b></div>
      <div class="match-progress-bar"><div class="match-progress-fill" style="width:${pct}%;"></div></div>
    </div>

    <h2 class="outline" style="font-size:22px;margin-bottom:14px;">${t('homeFormatTitle')}</h2>
    <div class="groups-grid" style="margin-bottom:34px;align-items:stretch;">
      <div class="group-card format-card">
        <h3>${t('homeStep1Title')} <span class="qual-tag">${t('homeStep1Date')}</span></h3>
        <div class="stage-note" style="margin-bottom:0;">${t('homeStep1Desc')}</div>
      </div>
      <div class="group-card format-card">
        <h3>${t('homeStep2Title')} <span class="qual-tag">${t('homeStep2Date')}</span></h3>
        <div class="stage-note" style="margin-bottom:0;">${t('homeStep2Desc')}</div>
      </div>
      <div class="group-card format-card">
        <h3>${t('homeStep3Title')} <span class="qual-tag">${t('homeStep3Date')}</span></h3>
        <div class="stage-note" style="margin-bottom:0;">${t('homeStep3Desc')}</div>
      </div>
    </div>

    <div class="stage-block">
      <h2 class="outline" style="font-size:20px;margin-bottom:12px;">${t('homeUpcoming')}</h2>
      ${upcoming.length? `<div class="cal-list">${upcoming.map(matchCardHTML).join('')}</div>` : `<div class="helptext">${t('calNoMatch')}</div>`}
    </div>
    <div class="stage-block">
      <h2 class="outline" style="font-size:20px;margin-bottom:12px;">${t('homeRecent')}</h2>
      ${recent.length? `<div class="cal-list">${recent.map(matchCardHTML).join('')}</div>` : `<div class="helptext">${t('homeNoResults')}</div>`}
    </div>

    <h2 class="outline" style="font-size:20px;margin-bottom:14px;">${t('homeExploreTitle')}</h2>
    <div class="groups-grid" style="margin-bottom:10px;">
      <div class="group-card explore-card" data-navto="standings"><h3>${t('homeLinkStandings')}</h3></div>
      <div class="group-card explore-card" data-navto="calendar"><h3>${t('homeLinkCalendar')}</h3></div>
      <div class="group-card explore-card" data-navto="teams"><h3>${t('homeLinkTeams')}</h3></div>
      <div class="group-card explore-card" data-navto="players"><h3>${t('homeLinkStats')}</h3></div>
    </div>

    <div class="thanks-text">${t('thanksText')}</div>
  `;
  el.innerHTML = html;
  el.querySelectorAll('.explore-card').forEach(card=>{
    card.onclick = ()=>{
      navHistory = [];
      const view = card.dataset.navto;
      setView(view);
      if(view==='teams'){ selectedTeam=null; renderTeamsView(); }
      window.scrollTo({top:0,behavior:'smooth'});
    };
  });
  if(status.phase==='before') startCountdown(getPlayInStartMs()); else clearCountdownInterval();
  ensureHomeLiveRefresh();
}
let homeLiveRefreshStarted = false;
function ensureHomeLiveRefresh(){
  if(homeLiveRefreshStarted) return;
  homeLiveRefreshStarted = true;
  setInterval(()=>{
    const el = document.getElementById('view-home');
    if(el && el.classList.contains('active')) renderHomeView();
  }, 30000);
}
let countdownInterval = null;
function clearCountdownInterval(){ if(countdownInterval){ clearInterval(countdownInterval); countdownInterval=null; } }
function startCountdown(targetMs){
  clearCountdownInterval();
  function tick(){
    const el = document.getElementById('playinCountdown');
    if(!el){ clearCountdownInterval(); return; } // navigated away from home — stop updating a detached element
    const diff = targetMs - Date.now();
    if(diff <= 0){
      clearCountdownInterval();
      renderHomeView(); // flips the banner over to "happening now" as soon as it hits zero
      return;
    }
    const s = Math.floor(diff/1000);
    const days = Math.floor(s/86400), hours = Math.floor((s%86400)/3600), minutes = Math.floor((s%3600)/60), seconds = s%60;
    const pad = n=>String(n).padStart(2,'0');
    el.textContent = (days>0 ? `${days}d ` : '') + `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }
  tick();
  countdownInterval = setInterval(tick, 1000);
}

function renderCalendarView(){
  const el = document.getElementById('view-calendar');
  const items = getAllMatchItems();

  let html = '';
  if(items.length===0){
    html = `<div class="cal-item">${t('calNoMatch')}</div>`;
  } else {
    items.sort((a,b)=> a.dateOrder-b.dateOrder);
    let currentDate = null;
    items.forEach(it=>{
      if(it.dateKey !== currentDate){
        if(currentDate!==null) html += `</div>`;
        html += `<div class="stage-subhead" style="margin-top:22px;">${it.dayLabel}</div><div class="cal-list">`;
        currentDate = it.dateKey;
      }
      html += matchCardHTML(it);
    });
    html += `</div>`;
  }
  el.innerHTML = html;
}

/* =========================================================
   TEAM STATS
========================================================= */
function getTeamStats(tag){
  let w=0,l=0,d=0,pf=0,pa=0,played=0;
  const appearances = [];
  function scan(groupsObj, label, anchorPrefix){
    for(const id in groupsObj){
      const g = groupsObj[id];
      const idx = g.slots.indexOf(tag);
      if(idx===-1) continue;
      const standings = computeStandings(g.slots, g.scores);
      const pos = standings.findIndex(r=>r.tag===tag)+1;
      appearances.push({label:`${label} · Gr. ${id}`, pos, total:g.slots.filter(x=>x!=null).length, anchor:`group-${anchorPrefix}-${id}`});
      pairsFor(g.slots.length).forEach(([i,j])=>{
        if(i!==idx && j!==idx) return;
        const sc = g.scores[i+'-'+j];
        if(!sc || sc[0]===''||sc[1]===''||sc[0]==null||sc[1]==null) return;
        const meIsHome = i===idx;
        const my = Number(meIsHome?sc[0]:sc[1]), opp = Number(meIsHome?sc[1]:sc[0]);
        played++; pf+=my; pa+=opp;
        if(my>opp) w++; else if(opp>my) l++; else d++;
      });
    }
  }
  scan(STATE.quali, t('stageQuali'), 'quali');
  scan(STATE.top, t('stagePhaseGroupes'), 'top');
  scan(STATE.mid, t('stagePhaseGroupes'), 'mid');
  // bracket
  const {rounds, roundScores} = deriveBracketRounds();
  for(let r=0;r<4;r++){
    const slots = rounds[r];
    const idx = slots.indexOf(tag);
    if(idx===-1) continue;
    const m = Math.floor(idx/2);
    const sc = roundScores[r][m];
    appearances.push({label:`${t('stageBracket')} · ${ROUND_NAMES_F()[r]}`, pos:null, total:null, anchor:null});
    if(sc && sc[0]!==''&&sc[1]!==''&&sc[0]!=null&&sc[1]!=null){
      const meIsHome = idx%2===0;
      const my = Number(meIsHome?sc[0]:sc[1]), opp = Number(meIsHome?sc[1]:sc[0]);
      played++; pf+=my; pa+=opp;
      if(my>opp) w++; else if(opp>my) l++; else d++;
    }
  }
  return {w,l,d,pf,pa,played,diff:pf-pa,appearances};
}

function stdDev(arr){
  if(arr.length<2) return null;
  const mean = arr.reduce((s,v)=>s+v,0)/arr.length;
  const variance = arr.reduce((s,v)=>s+(v-mean)*(v-mean),0)/arr.length;
  return Math.sqrt(variance);
}
function getAdvancedStats(){
  const playerAllRaces = {}; // "tag|name" -> [every individual race score across the tournament]
  const playerMatchRaces = {}; // "tag|name" -> [ [12 race scores for one full match], ... ]
  const teamMatchTotals = {}; // tag -> [ [6 player totals for one match], ... ]

  function scanMatch(pl, tagH, tagA){
    if(!pl) return;
    [[pl.h, tagH], [pl.a, tagA]].forEach(([arr, tag])=>{
      if(!tag || !arr) return;
      const matchTotals = [];
      arr.forEach(p=>{
        if(!p.n) return;
        const slotFilled = (p.races||[]).some(v=>v!=='' && v!=null);
        if(!slotFilled) return;
        // Team balance cares about how many points this slot contributed, regardless of who played it.
        matchTotals.push((p.races||[]).reduce((s,v)=> s + (v!=='' && v!=null ? Number(v) : 0), 0));
        // Individual stats (consistency, clutch) need to credit the right person per race.
        playerSegments(p).forEach(seg=>{
          const races = seg.races.map(v=> v!=='' && v!=null ? Number(v) : null);
          const filled = races.filter(v=>v!=null);
          if(!filled.length) return;
          const pkey = tag+'|'+seg.name;
          playerAllRaces[pkey] = (playerAllRaces[pkey]||[]).concat(filled);
          if(filled.length===12){ // only a full, un-substituted match counts toward "finishing strong"
            playerMatchRaces[pkey] = playerMatchRaces[pkey] || [];
            playerMatchRaces[pkey].push(races);
          }
        });
      });
      if(matchTotals.length===6){
        teamMatchTotals[tag] = teamMatchTotals[tag] || [];
        teamMatchTotals[tag].push(matchTotals);
      }
    });
  }
  function scanGroups(groupsObj){
    for(const id in groupsObj){
      const g = groupsObj[id];
      for(const key in (g.players||{})){
        const [i,j] = key.split('-').map(Number);
        scanMatch(g.players[key], g.slots[i], g.slots[j]);
      }
    }
  }
  scanGroups(STATE.quali); scanGroups(STATE.top); scanGroups(STATE.mid);
  const {rounds} = deriveBracketRounds();
  for(let r=0;r<4;r++){
    const slots = rounds[r];
    const pls = STATE.bracket.players['r'+r] || {};
    for(const m in pls) scanMatch(pls[m], slots[m*2], slots[m*2+1]);
  }

  // Consistency: gap between a player's best and worst individual race — smaller means steadier.
  const consistency = {};
  for(const pkey in playerAllRaces){
    const races = playerAllRaces[pkey];
    if(races.length<2) continue;
    consistency[pkey] = Math.max(...races) - Math.min(...races);
  }

  // Clutch: average of the last 3 races minus average of the first 9, per match, then averaged —
  // positive means a player tends to finish a match stronger than they started it.
  const clutch = {};
  for(const pkey in playerMatchRaces){
    const diffs = playerMatchRaces[pkey].map(races=>{
      const early = races.slice(0,9).reduce((s,v)=>s+v,0)/9;
      const late = races.slice(9,12).reduce((s,v)=>s+v,0)/3;
      return late-early;
    });
    if(diffs.length) clutch[pkey] = diffs.reduce((s,v)=>s+v,0)/diffs.length;
  }

  // Team balance: how spread out the 6 players' match totals are, averaged over the team's matches —
  // smaller means the points are shared evenly rather than resting on one or two players.
  const balance = {};
  for(const tag in teamMatchTotals){
    const perMatchSpread = teamMatchTotals[tag].map(totals=> stdDev(totals)).filter(v=>v!=null);
    if(perMatchSpread.length) balance[tag] = perMatchSpread.reduce((s,v)=>s+v,0)/perMatchSpread.length;
  }

  return { consistency, clutch, balance };
}
function getRaceStats(){
  const playerTrackStats = {}; // "tag|name" -> { trackId -> {count, total} }
  const teamTrackStats = {}; // tag -> { trackId -> {count, total} }

  function scanMatch(pl, tagH, tagA){
    if(!pl || !pl.tracks) return;
    [[pl.h, tagH], [pl.a, tagA]].forEach(([arr, tag])=>{
      if(!tag || !arr) return;
      // player-level: one entry per player, per race they actually played
      arr.forEach(p=>{
        if(!p.n) return;
        (p.races||[]).forEach((val, r)=>{
          if(val==='' || val==null) return;
          const score = Number(val)||0;
          const trackId = pl.tracks[r];
          if(!trackId) return;
          const owner = raceOwnerName(p, r);
          const pkey = tag+'|'+owner;
          playerTrackStats[pkey] = playerTrackStats[pkey] || {};
          playerTrackStats[pkey][trackId] = playerTrackStats[pkey][trackId] || {count:0, total:0};
          playerTrackStats[pkey][trackId].count++;
          playerTrackStats[pkey][trackId].total += score;
        });
      });
      // team-level: one entry per race the team actually played (not one per player),
      // using the team's combined score for that race — so 6 players playing the same
      // race counts as the team playing that track once, not six times.
      for(let r=0;r<12;r++){
        const trackId = pl.tracks[r];
        if(!trackId) continue;
        const scoresThisRace = arr.filter(p=>p.n && p.races && p.races[r]!=='' && p.races[r]!=null).map(p=>Number(p.races[r])||0);
        if(!scoresThisRace.length) continue;
        const teamRaceTotal = scoresThisRace.reduce((s,v)=>s+v,0);
        teamTrackStats[tag] = teamTrackStats[tag] || {};
        teamTrackStats[tag][trackId] = teamTrackStats[tag][trackId] || {count:0, total:0};
        teamTrackStats[tag][trackId].count++;
        teamTrackStats[tag][trackId].total += teamRaceTotal;
      }
    });
  }
  function scanGroups(groupsObj){
    for(const id in groupsObj){
      const g = groupsObj[id];
      for(const key in (g.players||{})){
        const [i,j] = key.split('-').map(Number);
        scanMatch(g.players[key], g.slots[i], g.slots[j]);
      }
    }
  }
  scanGroups(STATE.quali);
  scanGroups(STATE.top);
  scanGroups(STATE.mid);
  const {rounds} = deriveBracketRounds();
  for(let r=0;r<4;r++){
    const slots = rounds[r];
    const pls = STATE.bracket.players['r'+r] || {};
    for(const m in pls) scanMatch(pls[m], slots[m*2], slots[m*2+1]);
  }

  function bestTrackFromStats(statsObj){
    const result = {};
    for(const key in statsObj){
      let best=null, bestCount=-1, bestAvg=-1;
      for(const tid in statsObj[key]){
        const s = statsObj[key][tid];
        const avg = s.total/s.count;
        // Prefer the track played the most — a single lucky race shouldn't outrank a track
        // actually mastered over several attempts. Average only breaks ties within the same count.
        if(s.count>bestCount || (s.count===bestCount && avg>bestAvg)){ bestCount=s.count; bestAvg=avg; best=tid; }
      }
      result[key] = best;
    }
    return result;
  }

  return {
    bestTrackForPlayer: bestTrackFromStats(playerTrackStats),
    bestTrackForTeam: bestTrackFromStats(teamTrackStats),
    playerTrackStats, teamTrackStats,
  };
}
function trackBreakdownList(statsForKey){
  if(!statsForKey) return [];
  return Object.keys(statsForKey).map(tid=>({
    trackId: tid, count: statsForKey[tid].count, avg: statsForKey[tid].total/statsForKey[tid].count
  })).sort((a,b)=> b.count-a.count || b.avg-a.avg);
}
function formatMatchCount(n){
  if(n==null) return '—';
  const rounded = Math.round(n*10)/10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}
function getPlayerStats(){
  const stats = {}; // tag -> {name -> {count, total, w, l}}
  function add(tag, name, score, result, weight){
    if(!tag || !name) return;
    stats[tag] = stats[tag] || {};
    if(!stats[tag][name]) stats[tag][name] = {count:0, total:0, w:0, l:0};
    const s = stats[tag][name];
    s.count += weight;
    s.total += (isFinite(score) ? Number(score) : 0);
    if(result==='w') s.w += weight; else if(result==='l') s.l += weight;
  }
  function resultsFor(sc){
    if(!sc || sc[0]===''||sc[1]===''||sc[0]==null||sc[1]==null) return [null,null];
    const hh=Number(sc[0]), aa=Number(sc[1]);
    if(hh>aa) return ['w','l'];
    if(aa>hh) return ['l','w'];
    return [null,null];
  }
  function segFilled(seg){ return seg.races.some(v=>v!=='' && v!=null); }
  // A player who only raced part of a match (substitute, or a match still being encoded live)
  // is credited proportionally: e.g. 5 of 12 races counts as 0.4 of a match, with their real,
  // unprojected points — so their average per match stays fair without inventing scores.
  function segWeight(seg){ return seg.races.filter(v=>v!=='' && v!=null).length / 12; }
  function segTotal(seg){ return seg.races.reduce((s,v)=> s + (v!=='' && v!=null ? (Number(v)||0) : 0), 0); }
  function scan(groupsObj){
    for(const id in groupsObj){
      const g = groupsObj[id];
      for(const key in (g.players||{})){
        const [i,j] = key.split('-').map(Number);
        const pl = g.players[key];
        const [hRes,aRes] = resultsFor(g.scores[key]);
        (pl.h||[]).forEach(p=> playerSegments(p).forEach(seg=>{ if(segFilled(seg)) add(g.slots[i], seg.name, segTotal(seg), hRes, segWeight(seg)); }));
        (pl.a||[]).forEach(p=> playerSegments(p).forEach(seg=>{ if(segFilled(seg)) add(g.slots[j], seg.name, segTotal(seg), aRes, segWeight(seg)); }));
      }
    }
  }
  scan(STATE.quali); scan(STATE.top); scan(STATE.mid);
  const {rounds, roundScores} = deriveBracketRounds();
  for(let r=0;r<4;r++){
    const slots = rounds[r];
    const pls = STATE.bracket.players['r'+r] || {};
    for(const m in pls){
      const pl = pls[m];
      const h = slots[m*2], a = slots[m*2+1];
      const [hRes,aRes] = resultsFor(roundScores[r][m]);
      (pl.h||[]).forEach(p=> playerSegments(p).forEach(seg=>{ if(segFilled(seg)) add(h, seg.name, segTotal(seg), hRes, segWeight(seg)); }));
      (pl.a||[]).forEach(p=> playerSegments(p).forEach(seg=>{ if(segFilled(seg)) add(a, seg.name, segTotal(seg), aRes, segWeight(seg)); }));
    }
  }
  // compute averages
  for(const tag in stats){
    for(const name in stats[tag]){
      const s = stats[tag][name];
      s.avg = s.count ? s.total/s.count : 0;
      s.winPct = s.count ? s.w/s.count : 0;
    }
  }
  return stats;
}
function getAllTeamStats(){
  return Object.keys(TEAMS).map(tag=>{
    const st = getTeamStats(tag);
    return {tag, ...st, winPct: st.played ? st.w/st.played : 0, avg: st.played ? st.pf/st.played : 0};
  });
}
const PROJECTED_RANK = ['JPN','FR','USA','ESP','CAN','ENG','GER','ITA','IRE','ASIA','BE','KOR','MEX','AUS','CL','CB','NL','EEU','VE','HKT','PE','PR','BRA','MENA','EC','CH','AUT','CA','PT','RD','LUX'];
function projectedRank(tag){
  const i = PROJECTED_RANK.indexOf(tag);
  return i===-1 ? 999 : i;
}
function teamTier(tag){
  for(const id in STATE.top){ if(STATE.top[id].slots.includes(tag)) return 'higher'; }
  for(const id in STATE.mid){ if(STATE.mid[id].slots.includes(tag)) return 'middle'; }
  return 'lower';
}
// kept for compatibility with any leftover callers — now backed by the same data
function getMvpCounts(){
  const stats = getPlayerStats();
  const counts = {};
  for(const tag in stats){
    counts[tag] = {};
    for(const name in stats[tag]) counts[tag][name] = stats[tag][name].count;
  }
  return counts;
}

/* =========================================================
   RENDER: TEAMS VIEW
========================================================= */
let selectedTeam = null;
let navHistory = [];
function pushNavHistory(){ navHistory.push({view: currentView, selectedTeam, selectedMatch}); }
function backLabel(){
  const entry = navHistory[navHistory.length-1];
  if(!entry) return `← ${t('navTeams')}`;
  switch(entry.view){
    case 'standings': return `← ${t('navStandings')}`;
    case 'calendar': return `← ${t('navCalendar')}`;
    case 'players': return `← ${t('navPlayers')}`;
    case 'teams': return `← ${entry.selectedTeam ? teamName(entry.selectedTeam) : t('navTeams')}`;
    case 'match': {
      const md = parseMatchRef(entry.selectedMatch);
      return md ? `← ${teamName(md.h)} ${t('vs')} ${teamName(md.a)}` : `← ${t('navCalendar')}`;
    }
    default: return `← ${t('backGeneric')}`;
  }
}
function goBack(){
  if(navHistory.length){
    const prev = navHistory.pop();
    selectedTeam = prev.selectedTeam;
    selectedMatch = prev.selectedMatch;
    setView(prev.view);
    if(prev.view==='teams') renderTeamsView();
    else if(prev.view==='match') renderMatchDetail(selectedMatch);
  } else {
    selectedTeam = null; selectedMatch = null;
    setView('teams'); renderTeamsView();
  }
  window.scrollTo({top:0,behavior:'smooth'});
}

function renderTeamsView(){
  const el = document.getElementById('view-teams');
  if(selectedTeam){ el.innerHTML = renderTeamDetail(selectedTeam); wireTeamDetailEvents(); return; }
  if(el.dataset.gridLang === LANG && el.querySelector('.flag-grid')){
    return; // the 31-flag grid is already sitting there correctly, nothing to rebuild
  }
  const tags = Object.keys(TEAMS).sort((a,b)=>teamName(a).localeCompare(teamName(b)));
  let html = `<div class="stage-note" style="margin-bottom:14px;">${t('teamsIntro')}</div>`;
  html += `<div class="flag-grid">`;
  tags.forEach(tag=>{
    html += `<div class="flag-grid-item" data-team="${tag}" title="${teamName(tag)}">
      <div class="fgi-flag"><img src="flags/${tag}.png" alt="" style="width:100%;height:100%;display:block;"></div>
      <div class="fgi-overlay"><span>${teamName(tag)}</span></div>
    </div>`;
  });
  html += `</div>`;
  el.innerHTML = html;
  el.dataset.gridLang = LANG;
  el.querySelectorAll('.flag-grid-item').forEach(item=>{
    item.onclick = ()=>{ pushNavHistory(); selectedTeam = item.dataset.team; updateHero('teams'); renderTeamsView(); window.scrollTo({top:0,behavior:'smooth'}); };
  });
}

function getAllTeamMatches(tag){
  const items = [];
  function scan(groupsObj, stageLabel, dateStr, anchorPrefix, coarseOrder){
    for(const id in groupsObj){
      const g = groupsObj[id];
      const idx = g.slots.indexOf(tag);
      if(idx===-1) continue;
      pairsFor(g.slots.length).forEach(([i,j])=>{
        if(i!==idx && j!==idx) return;
        const opp = g.slots[i===idx?j:i];
        if(opp==null) return;
        const key = i+'-'+j;
        const sc = g.scores[key];
        const played = sc && sc[0]!=='' && sc[1]!=='' && sc[0]!=null && sc[1]!=null;
        const mySc = played ? (i===idx ? sc : [sc[1],sc[0]]) : null;
        const iso = scheduledTimeFor(anchorPrefix, id, key);
        const dateOrder = coarseOrder*1e10 + (iso ? Math.floor(new Date(iso).getTime()/1000) : 0);
        items.push({stage:`${stageLabel} · Gr. ${id}`, date: iso ? formatScheduledLocal(iso) : dateStr, opp, sc:mySc, played, dateOrder, anchor:`group-${anchorPrefix}-${id}`, matchRef:`g|${anchorPrefix}|${id}|${i}|${j}`});
      });
    }
  }
  scan(STATE.quali, t('stageQuali'), t('dateQuali'), 'quali', 0);
  scan(STATE.top, t('stagePhaseGroupes'), t('datePhase'), 'top', 1);
  scan(STATE.mid, t('stagePhaseGroupes'), t('datePhase'), 'mid', 1);
  const {rounds, roundScores} = deriveBracketRounds();
  for(let r=0;r<4;r++){
    const slots = rounds[r];
    const idx = slots.indexOf(tag);
    if(idx===-1) continue;
    const m = Math.floor(idx/2);
    const opp = slots[idx%2===0?idx+1:idx-1];
    if(opp==null) continue;
    const sc = roundScores[r][m];
    const played = sc && sc[0]!=='' && sc[1]!=='' && sc[0]!=null && sc[1]!=null;
    const mySc = played ? (idx%2===0 ? sc : [sc[1],sc[0]]) : null;
    items.push({stage:`${t('stageBracket')} · ${ROUND_NAMES_F()[r]}`, date:ROUND_DATES_F()[r], opp, sc:mySc, played, dateOrder:(2+r)*1e10, matchRef:`b|${r}|${m}`});
  }
  items.sort((a,b)=> a.dateOrder-b.dateOrder);
  return items;
}
function getUpcomingMatchesFor(tag){ return getAllTeamMatches(tag).filter(it=>!it.played); }
function getRecentResultsFor(tag){ return getAllTeamMatches(tag).filter(it=>it.played); }

function renderTeamDetail(tag){
  const players = roster(tag);
  const stats = getTeamStats(tag);
  const upcoming = getUpcomingMatchesFor(tag);
  const recent = getRecentResultsFor(tag);
  const playerStats = getPlayerStats();
  const raceStats = getRaceStats();
  const advStats = getAdvancedStats();
  const myStats = playerStats[tag] || {};
  const winPct = stats.played ? Math.round((stats.w/stats.played)*100) : null;
  const teamBestTrack = raceStats.bestTrackForTeam[tag];
  const playerRows = players
    .map(p=>({p, s:myStats[p.n]||null}))
    .sort((a,b)=> (b.s?b.s.count:-1) - (a.s?a.s.count:-1) || (b.s?b.s.avg:-1) - (a.s?a.s.avg:-1));
  return `
    <button class="back-btn" id="backToTeamsBtn">${backLabel()}</button>
    <div class="team-detail-page">
      <div class="tdp-header">
        ${flagEl(tag,'lg')}
        <h2 class="outline">${teamFullName(tag)}</h2>
      </div>
      <div class="stat-strip">
        <div class="s">${t('statMatches')} <b>${stats.played}</b></div>
        <div class="s">${t('statW')} <b>${stats.w}</b></div>
        <div class="s">${t('colD')} <b>${stats.d}</b></div>
        <div class="s">${t('statL')} <b>${stats.l}</b></div>
        <div class="s">${t('colWinPct')} <b>${winPct!=null?winPct+'%':'—'}</b></div>
        <div class="s">${t('statDiff')} <b>${stats.diff>0?'+':''}${stats.diff}</b></div>
        <div class="s">${t('statPlayers')} <b>${players.length}</b></div>
        <div class="s">${t('colBestTrack')} <b>${teamBestTrack?trackName(teamBestTrack):'—'}</b></div>
        <div class="s">${t('colBalance')} <b>${advStats.balance[tag]!=null?advStats.balance[tag].toFixed(1):'—'}</b></div>
      </div>
      ${stats.appearances.length? `<div class="helptext" style="margin:10px 0;">${stats.appearances.map(a=>a.anchor?`<span class="stage-link" data-anchor="${a.anchor}">${a.label}</span>`:a.label).join(' · ')}</div>` : ''}
      <h3 style="margin:18px 0 10px;font-size:16px;color:var(--gold);">${t('homeRecent')}</h3>
      ${recent.length? `<div class="cal-list" style="margin-bottom:8px;">${recent.map(u=>{
          const won = Number(u.sc[0])>Number(u.sc[1]);
          return `<div class="cal-item match-card" data-matchref="${u.matchRef}">
          <span class="cal-stage">${u.stage}</span>
          <span class="cal-teams">${teamPlainHTML(u.opp)}</span>
          <span class="cal-score done"><span class="${won?'score-win':'score-lose'}">${u.sc[0]}</span> – <span class="${!won?'score-win':'score-lose'}">${u.sc[1]}</span></span>
          <span class="cal-date">${u.date}</span>
        </div>`;
        }).join('')}</div>` : `<div class="helptext" style="margin-bottom:8px;">${t('homeNoResults')}</div>`}
      <h3 style="margin:18px 0 10px;font-size:16px;color:var(--gold);">${t('upcomingMatches')}</h3>
      ${upcoming.length? `<div class="cal-list" style="margin-bottom:8px;">${upcoming.map(u=>`<div class="cal-item match-card" data-matchref="${u.matchRef}">
          <span class="cal-stage">${u.stage}</span>
          <span class="cal-teams">${teamPlainHTML(u.opp)}</span>
          <span class="cal-score"></span>
          <span class="cal-date emphasize">${u.date}</span>
        </div>`).join('')}</div>` : `<div class="helptext" style="margin-bottom:8px;">${t('noUpcoming')}</div>`}
      <h3 style="margin:18px 0 10px;font-size:16px;color:var(--gold);">${t('roster')}</h3>
      <div class="stats-table-wrap">
        <table class="stats-table">
          <thead><tr><th></th><th>${t('colPlayer')}</th><th class="num">${t('colWarsPlayed')}</th><th class="num">${t('colWinPct')}</th><th class="num">${t('colAvg')}</th><th>${t('colBestTrack')}</th><th class="num">${t('colConsistency')}</th><th class="num">${t('colClutch')}</th></tr></thead>
          <tbody>
            ${playerRows.map(({p,s})=>{
              const bestTid = raceStats.bestTrackForPlayer[tag+'|'+p.n];
              const pkey = tag+'|'+p.n;
              const cons = advStats.consistency[pkey];
              const clu = advStats.clutch[pkey];
              return `<tr class="player-row-link" data-player-tag="${tag}" data-player-name="${p.n}">
              <td style="text-align:center;"><span class="nat-badge" data-tooltip="${natName(p.nat)}">${p.nat}</span></td>
              <td class="lname">${p.n}</td>
              <td class="num">${s?formatMatchCount(s.count):'—'}</td>
              <td class="num">${s?Math.round(s.winPct*100)+'%':'—'}</td>
              <td class="num ${s?'highlight':''}">${s?s.avg.toFixed(1):'—'}</td>
              <td class="lteam">${bestTid?trackName(bestTid):'—'}</td>
              <td class="num">${cons!=null?cons.toFixed(1):'—'}</td>
              <td class="num">${clu!=null?(clu>0?'+':'')+clu.toFixed(1):'—'}</td>
            </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>

      <h3 style="margin:18px 0 10px;font-size:16px;color:var(--gold);">${t('teamTracksTitle')}</h3>
      <div class="stats-table-wrap">
        <table class="stats-table">
          <thead><tr><th>${t('colTrack')}</th><th class="num">${t('colRacesPlayed')}</th><th class="num">${t('colAvg')}</th></tr></thead>
          <tbody>
            ${(()=>{ const teamBreakdown = trackBreakdownList(raceStats.teamTrackStats[tag]);
              return teamBreakdown.length ? teamBreakdown.map(b=>`<tr><td class="lteam">${trackName(b.trackId)}</td><td class="num">${b.count}</td><td class="num highlight">${b.avg.toFixed(1)}</td></tr>`).join('')
                : `<tr><td colspan="3" class="helptext">${t('playersEmpty')}</td></tr>`;
            })()}
          </tbody>
        </table>
      </div>
    </div>
  `;
}
function wireTeamDetailEvents(){
  const btn = document.getElementById('backToTeamsBtn');
  if(btn) btn.onclick = goBack;
  document.querySelectorAll('.player-row-link').forEach(row=>{
    row.onclick = ()=>{
      pushNavHistory();
      selectedPlayer = {tag: row.dataset.playerTag, name: row.dataset.playerName};
      setView('player');
      renderPlayerDetail(selectedPlayer.tag, selectedPlayer.name);
      window.scrollTo({top:0,behavior:'smooth'});
    };
  });
}
function renderPlayerDetail(tag, name){
  const el = document.getElementById('view-player');
  const playerStats = getPlayerStats();
  const raceStats = getRaceStats();
  const advStats = getAdvancedStats();
  const pkey = tag+'|'+name;
  const s = (playerStats[tag]||{})[name] || null;
  const bestTid = raceStats.bestTrackForPlayer[pkey];
  const cons = advStats.consistency[pkey];
  const clu = advStats.clutch[pkey];
  const breakdown = trackBreakdownList(raceStats.playerTrackStats[pkey]);
  const natEntry = roster(tag).find(p=>p.n===name);

  el.innerHTML = `
    <button class="back-btn" id="backToPlayerBtn">${backLabel()}</button>
    <div class="team-detail-page">
      <div class="tdp-header">
        <span class="team-link" data-team="${tag}">${flagEl(tag,'lg')}</span>
        <div>
          <h2 class="outline" style="margin-bottom:2px;">${name}</h2>
          <span class="team-link" data-team="${tag}" style="font-size:14px;color:var(--dim);cursor:pointer;">${teamName(tag)}</span>
          ${natEntry? `<span class="nat-badge" data-tooltip="${natName(natEntry.nat)}" style="margin-left:8px;">${natEntry.nat}</span>` : ''}
        </div>
      </div>
      <div class="stat-strip">
        <div class="s">${t('colWarsPlayed')} <b>${s?formatMatchCount(s.count):'—'}</b></div>
        <div class="s">${t('colWinPct')} <b>${s?Math.round(s.winPct*100)+'%':'—'}</b></div>
        <div class="s">${t('colAvg')} <b>${s?s.avg.toFixed(1):'—'}</b></div>
        <div class="s">${t('colBestTrack')} <b>${bestTid?trackName(bestTid):'—'}</b></div>
        <div class="s">${t('colConsistency')} <b>${cons!=null?cons.toFixed(1):'—'}</b></div>
        <div class="s">${t('colClutch')} <b>${clu!=null?(clu>0?'+':'')+clu.toFixed(1):'—'}</b></div>
      </div>
      <h3 style="margin:18px 0 10px;font-size:16px;color:var(--gold);">${t('colTrack')}</h3>
      <div class="stats-table-wrap">
        <table class="stats-table">
          <thead><tr><th>${t('colTrack')}</th><th class="num">${t('colRacesPlayed')}</th><th class="num">${t('colAvg')}</th></tr></thead>
          <tbody>
            ${breakdown.length? breakdown.map(b=>`<tr><td class="lteam">${trackName(b.trackId)}</td><td class="num">${b.count}</td><td class="num highlight">${b.avg.toFixed(1)}</td></tr>`).join('')
              : `<tr><td colspan="3" class="helptext">${t('playersEmpty')}</td></tr>`}
          </tbody>
        </table>
      </div>
    </div>
  `;
  document.getElementById('backToPlayerBtn').onclick = goBack;
}

/* =========================================================
   RENDER: PLAYERS VIEW
========================================================= */
let statsMode = 'players';
function renderPlayersView(){
  const el = document.getElementById('view-players');
  const raceStats = getRaceStats();
  const advStats = getAdvancedStats();
  let html = `<div class="admin-select-row" style="margin-bottom:16px;">
    <button class="chip ${statsMode==='players'?'active':''}" data-statsmode="players">${t('tabPlayers')}</button>
    <button class="chip ${statsMode==='teams'?'active':''}" data-statsmode="teams">${t('tabTeamsStats')}</button>
  </div>`;

  if(statsMode==='players'){
    const playerStats = getPlayerStats();
    let all = [];
    for(const tag in playerStats){
      for(const name in playerStats[tag]){
        const s = playerStats[tag][name];
        all.push({tag, name, avg:s.avg, count:s.count, w:s.w, l:s.l, winPct:s.winPct});
      }
    }
    all.sort((a,b)=> b.count-a.count || b.avg-a.avg);

    html += `<div class="stage-note">${t('playersNote')} ${all.length===0?t('playersEmpty'):''}</div>`;
    if(all.length){
      html += `<div class="stats-table-wrap"><table class="stats-table" id="leaderList">
        <thead><tr><th></th><th>${t('colPlayer')}</th><th>${t('colTeam')}</th><th class="num">${t('colWarsPlayed')}</th><th class="num">${t('colWinPct')}</th><th class="num">${t('colAvg')}</th><th>${t('colBestTrack')}</th><th class="num">${t('colConsistency')}</th><th class="num">${t('colClutch')}</th></tr></thead>
        <tbody>`;
      all.forEach((p,i)=>{
        const bestTid = raceStats.bestTrackForPlayer[p.tag+'|'+p.name];
        const pkey = p.tag+'|'+p.name;
        const cons = advStats.consistency[pkey];
        const clu = advStats.clutch[pkey];
        html += `<tr class="leader-row player-row-link" data-name="${p.name.toLowerCase()}" data-team="${teamName(p.tag).toLowerCase()}" data-player-tag="${p.tag}" data-player-name="${p.name}">
          <td class="lp ${i===0?'top1':''}">${i+1}</td>
          <td><span class="teamcell">${flagEl(p.tag,'sm')}<span class="lname">${p.name}</span></span></td>
          <td class="lteam">${teamName(p.tag)}</td>
          <td class="num">${formatMatchCount(p.count)}</td>
          <td class="num">${Math.round(p.winPct*100)}%</td>
          <td class="num highlight">${p.avg.toFixed(1)}</td>
          <td class="lteam">${bestTid?trackName(bestTid):'—'}</td>
          <td class="num">${cons!=null?cons.toFixed(1):'—'}</td>
          <td class="num">${clu!=null?(clu>0?'+':'')+clu.toFixed(1):'—'}</td>
        </tr>`;
      });
      html += `</tbody></table></div>`;
    }
  } else {
    const TIER_ORDER = {higher:0, middle:1, lower:2};
    function compareTeams(a, b){
      const aPlayed = a.played>0, bPlayed = b.played>0;
      if(!aPlayed && !bPlayed){
        // neither has played yet: pure pre-tournament projected ranking (can cross tiers)
        return projectedRank(a.tag)-projectedRank(b.tag);
      }
      if(aPlayed !== bPlayed){
        // one has played, the other hasn't: only let real results override the projection
        // if the active team is from an equal-or-higher tier than the team still waiting
        const tierDiff = TIER_ORDER[teamTier(a.tag)] - TIER_ORDER[teamTier(b.tag)];
        if(tierDiff !== 0) return tierDiff;
        return aPlayed ? -1 : 1;
      }
      // both have played: rank purely on average score per match, regardless of how many
      // matches each has played. Win%, point diff and projection only break exact ties.
      return (b.avg-a.avg) || b.winPct-a.winPct || b.diff-a.diff || projectedRank(a.tag)-projectedRank(b.tag);
    }
    const teams = getAllTeamStats().sort(compareTeams);
    html += `<div class="stage-note">${t('teamsStatsNote')}</div>`;
    html += `<div class="stats-table-wrap"><table class="stats-table" id="teamStatsList">
      <thead><tr><th></th><th>${t('colTeam')}</th><th class="num">${t('statMatches')}</th><th class="num">${t('statW')}</th><th class="num">${t('colD')}</th><th class="num">${t('statL')}</th><th class="num">${t('colWinPct')}</th><th class="num">${t('statDiff')}</th><th class="num">${t('colAvg')}</th><th>${t('colBestTrack')}</th><th class="num">${t('colBalance')}</th></tr></thead>
      <tbody>`;
    teams.forEach((tm,i)=>{
      const bestTid = raceStats.bestTrackForTeam[tm.tag];
      const bal = advStats.balance[tm.tag];
      html += `<tr class="leader-row" data-team="${teamName(tm.tag).toLowerCase()}">
        <td class="lp ${i===0?'top1':''}">${i+1}</td>
        <td><span class="teamcell">${teamLinkHTML(tm.tag)}</span></td>
        <td class="num">${tm.played}</td>
        <td class="num">${tm.w}</td>
        <td class="num">${tm.d}</td>
        <td class="num">${tm.l}</td>
        <td class="num">${tm.played? Math.round(tm.winPct*100)+'%' : '—'}</td>
        <td class="num">${tm.diff>0?'+':''}${tm.diff}</td>
        <td class="num highlight">${tm.played? tm.avg.toFixed(1) : '—'}</td>
        <td class="lteam">${bestTid?trackName(bestTid):'—'}</td>
        <td class="num">${bal!=null?bal.toFixed(1):'—'}</td>
      </tr>`;
    });
    html += `</tbody></table></div>`;
  }

  el.innerHTML = html;
  el.querySelectorAll('[data-statsmode]').forEach(b=> b.onclick = ()=>{ statsMode = b.dataset.statsmode; renderPlayersView(); });
  el.querySelectorAll('.player-row-link').forEach(row=>{
    row.onclick = ()=>{
      pushNavHistory();
      selectedPlayer = {tag: row.dataset.playerTag, name: row.dataset.playerName};
      setView('player');
      renderPlayerDetail(selectedPlayer.tag, selectedPlayer.name);
      window.scrollTo({top:0,behavior:'smooth'});
    };
  });
}

/* =========================================================
/* =========================================================
   NAV
========================================================= */
function HERO_INFO_F(){ return {
  home: {title:t('heroTitleMain'), sub:t('heroSubMain')},
  standings: {title:t('heroTitleStandings'), sub:t('heroSubStandings')},
  calendar: {title:t('heroTitleCalendar'), sub:t('heroSubCalendar')},
  teams: {title:t('heroTitleTeams'), sub:t('heroSubTeams')},
  players: {title:t('heroTitlePlayers'), sub:t('heroSubPlayers')},
};}
let selectedMatch = null;
let selectedPlayer = null; // {tag, name}
function updateHero(view){
  const HERO_INFO = HERO_INFO_F();
  let info = HERO_INFO[view] || HERO_INFO.home;
  if(view==='teams' && selectedTeam && TEAMS[selectedTeam]){ info = {title: teamFullName(selectedTeam), sub:''}; }
  if(view==='match' && selectedMatch){
    const md = parseMatchRef(selectedMatch);
    if(md) info = {title: `${teamName(md.h)} ${t('vs')} ${teamName(md.a)}`, sub: md.stage};
  }
  document.getElementById('heroTitle').textContent = info.title;
  const subEl = document.getElementById('heroSub');
  subEl.textContent = info.sub;
  subEl.style.display = info.sub ? '' : 'none';
}
// Each static page boots directly into its own section (set via
// window.MKWC_INITIAL_VIEW, written inline before this script loads) instead
// of always starting on "home" as the original single-page app did.
let currentView = window.MKWC_INITIAL_VIEW || 'home';
const VIEW_RENDERERS = {
  home: renderHomeView,
  standings: renderStandingsView,
  calendar: renderCalendarView,
  teams: renderTeamsView,
  players: renderPlayersView,
};
let dirtyViews = new Set(Object.keys(VIEW_RENDERERS));
function markAllDirty(){ dirtyViews = new Set(Object.keys(VIEW_RENDERERS)); }
function ensureViewRendered(view){
  if(VIEW_RENDERERS[view] && dirtyViews.has(view)){
    const __t0 = performance.now();
    VIEW_RENDERERS[view]();
    console.log(`[perf] rendu de la vue "${view}" : ${(performance.now()-__t0).toFixed(1)} ms`);
    dirtyViews.delete(view);
  }
}
function renderAll(){
  // Data changed: refresh what's on screen right now instantly, quietly mark
  // the rest as due for a rebuild next time the visitor actually opens that tab.
  markAllDirty();
  ensureViewRendered(currentView);
  if(currentView==='teams' && selectedTeam) dirtyViews.add('teams'); // detail page depends on selection, always fresh
}

let restoringFromHistory = false;
function pushBrowserHistory(){
  if(restoringFromHistory) return; // don't re-push while we're the ones restoring a state
  const state = {view: currentView, selectedTeam, selectedMatch, selectedPlayer};
  let hash = '#'+currentView;
  if(currentView==='teams' && selectedTeam) hash += '/'+selectedTeam;
  if(currentView==='match' && selectedMatch) hash += '/'+encodeURIComponent(selectedMatch);
  if(currentView==='player' && selectedPlayer) hash += '/'+selectedPlayer.tag+'/'+encodeURIComponent(selectedPlayer.name);
  try{ history.pushState(state, '', hash); }
  catch(e){ /* some embedded/sandboxed environments (e.g. a preview iframe) disallow this — harmless to skip there */ }
}
function setView(view){
  const __setViewT0 = performance.now();
  __trace(`setView('${view}') appelé (clic reçu)`);
  currentView = view;
  document.querySelectorAll('.navbtn').forEach(b=>b.classList.toggle('active', b.dataset.view===view));
  document.querySelectorAll('main section').forEach(s=>s.classList.remove('active'));
  const map = {home:'view-home', standings:'view-standings', calendar:'view-calendar', teams:'view-teams', match:'view-match', player:'view-player', players:'view-players'};
  document.getElementById(map[view]).classList.add('active');
  updateHero(view);
  ensureViewRendered(view);
  window.scrollTo(0, 0); // each view starts fresh at the top, never inheriting another view's scroll position
  pushBrowserHistory();
  console.log(`[perf] setView('${view}') total (jusqu'à la fin de la fonction) : ${(performance.now()-__setViewT0).toFixed(1)} ms`);
}
window.addEventListener('popstate', (e)=>{
  restoringFromHistory = true;
  const state = e.state || {view: window.MKWC_INITIAL_VIEW || 'home', selectedTeam:null, selectedMatch:null, selectedPlayer:null};
  selectedTeam = state.selectedTeam || null;
  selectedMatch = state.selectedMatch || null;
  selectedPlayer = state.selectedPlayer || null;
  setView(state.view || (window.MKWC_INITIAL_VIEW || 'home'));
  if(state.view==='teams') renderTeamsView();
  if(state.view==='match') renderMatchDetail(selectedMatch);
  if(state.view==='player' && selectedPlayer) renderPlayerDetail(selectedPlayer.tag, selectedPlayer.name);
  restoringFromHistory = false;
});
document.querySelector('main').addEventListener('click', (e)=>{
  const link = e.target.closest('.team-link');
  if(link){
    pushNavHistory();
    selectedTeam = link.dataset.team;
    setView('teams');
    renderTeamsView();
    window.scrollTo({top:0,behavior:'smooth'});
    return;
  }
  const stageLink = e.target.closest('.stage-link');
  if(stageLink){
    setView('standings');
    setTimeout(()=>{
      const target = document.getElementById(stageLink.dataset.anchor);
      if(target){
        target.scrollIntoView({behavior:'smooth', block:'center'});
        target.style.transition = 'box-shadow .3s';
        target.style.boxShadow = '0 0 0 3px var(--gold)';
        setTimeout(()=>{ target.style.boxShadow = ''; }, 1400);
      }
    }, 60);
    return;
  }
  const matchCard = e.target.closest('.match-card');
  if(matchCard){
    pushNavHistory();
    selectedMatch = matchCard.dataset.matchref;
    setView('match');
    renderMatchDetail(selectedMatch);
    window.scrollTo({top:0,behavior:'smooth'});
  }
});

function applyStaticI18n(){
  document.querySelectorAll('[data-i18n]').forEach(el=>{ el.textContent = t(el.dataset.i18n); });
}
function renderLangSwitch(){
  const el = document.getElementById('langSwitch');
  el.innerHTML = LANGS.map(l=>`<button class="${l.code===LANG?'active':''}" data-lang="${l.code}">${l.label}</button>`).join('');
  el.querySelectorAll('button').forEach(b=> b.onclick = async ()=>{
    LANG = b.dataset.lang;
    try{ localStorage.setItem('mkwc_lang_pref', LANG); }catch(e){}
    applyStaticI18n();
    renderLangSwitch();
    updateHero(currentView);
    renderAll();
    if(currentView==='match') renderMatchDetail(selectedMatch);
  });
}
async function loadLangPref(){
  // English by default for a visitor's very first visit; their own past choice
  // (if any) takes over on later visits.
  try{
    const saved = localStorage.getItem('mkwc_lang_pref');
    if(saved && I18N[saved]) LANG = saved;
  }catch(e){ /* stick with the English default */ }
}

(async function init(){
  __trace('init() démarre');
  try{ history.replaceState({view: currentView, selectedTeam:null, selectedMatch:null}, '', '#'+currentView); }catch(e){}
  __trace('avant loadState');
  await loadState();
  __trace('après loadState');
  migrateAllPlayerData();
  await loadLangPref();
  applyStaticI18n();
  renderLangSwitch();
  updateHero(currentView);
  __trace('avant renderAll (premier rendu)');
  renderAll();
  __trace('après renderAll (premier rendu)');
  const loadScreen = document.getElementById('loadScreen');
  if(loadScreen){
    loadScreen.style.transition = 'opacity .25s ease';
    loadScreen.style.opacity = '0';
    setTimeout(()=> loadScreen.remove(), 300);
  }
  __trace('init() terminé, écran de chargement retiré');
})();

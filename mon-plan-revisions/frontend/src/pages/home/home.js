import React, { useState } from "react";
import './home.css';

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}
function formatDateShort(date) {
  // Affiche 27/05
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
}
function getMonday(d) {
  d = new Date(d);
  const day = d.getDay();
  const diff = d.getDate() - ((day + 6) % 7);
  return new Date(d.setDate(diff));
}

// Liste des jours de la semaine
const jours = [
  "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche",
];

// Génère la liste des 26 semaines à partir d'aujourd'hui (retourne [{lundi, dimanche, label}])
function get26Semaines() {
  const semaines = [];
  let lundi = getMonday(new Date());
  for (let i = 0; i < 26; i++) {
    const dimanche = addDays(lundi, 6);
    semaines.push({
      lundi: new Date(lundi),
      dimanche: new Date(dimanche),
      label: `Du ${formatDateShort(lundi)} au ${formatDateShort(dimanche)}`
    });
    lundi = addDays(lundi, 7);
  }
  return semaines;
}

function App() {
  const [matieres, setMatieres] = useState([]);
  const [nomMatiere, setNomMatiere] = useState("");
  const [etape, setEtape] = useState(1);
  const [horaireMatiere, setHoraireMatiere] = useState("");
  const [jour, setJour] = useState("Lundi");
  const [heureDebut, setHeureDebut] = useState("");
  const [heureFin, setHeureFin] = useState("");
  const [typeSeance, setTypeSeance] = useState("Cours");
  const [typeGeneral, setTypeGeneral] = useState("Scolaire");
  const [activitePerso, setActivitePerso] = useState("");
  const [horaires, setHoraires] = useState([]);
  const [alertMessage, setAlertMessage] = useState("");
  const [editIndex, setEditIndex] = useState(null);

  // Nouvel état : lundi de la semaine sélectionnée
  const [dateLundi, setDateLundi] = useState(getMonday(new Date()));

  // Liste des 26 semaines (généré une seule fois)
  const semaines = get26Semaines();

  // Pour la dropdown : trouver l'index de la semaine actuellement sélectionnée
  const semaineIndex = semaines.findIndex(
    s => s.lundi.toDateString() === dateLundi.toDateString()
  );

  // --- Étape 1 et 2 (inchangé) ---
  const ajouterMatiere = (e) => {
    e.preventDefault();
    const trimmed = nomMatiere.trim();
    if (!trimmed) {
      setAlertMessage("Le nom de la matière ne peut pas être vide.");
      return;
    }
    if (matieres.includes(trimmed)) {
      setAlertMessage(`La matière "${trimmed}" est déjà ajoutée.`);
      return;
    }
    setMatieres([...matieres, trimmed]);
    setNomMatiere("");
    setAlertMessage("");
  };

  const passerEtape2 = () => {
    if (matieres.length === 0) {
      setAlertMessage("Ajoutez au moins une matière avant de continuer.");
      return;
    }
    setHoraireMatiere(matieres[0]);
    setEtape(2);
    setAlertMessage("");
  };

  function timeToMinutes(time) {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
  }

  // Gestion des horaires
  const chevauchement = (nouveau, indexExclu = null) => {
    return horaires.some((h, i) => {
      if (i === indexExclu) return false;
      if (h.date !== nouveau.date) return false;
      const debutN = timeToMinutes(nouveau.heureDebut);
      const finN = timeToMinutes(nouveau.heureFin);
      const debutH = timeToMinutes(h.heureDebut);
      const finH = timeToMinutes(h.heureFin);
      return debutN < finH && finN > debutH;
    });
  };

  const totalMinutesJour = (date, indexExclu = null) => {
    return horaires.reduce((total, h, i) => {
      if (i === indexExclu) return total;
      if (h.date !== date) return total;
      const duree = timeToMinutes(h.heureFin) - timeToMinutes(h.heureDebut);
      return total + duree;
    }, 0);
  };

  const enregistrerHoraire = (e) => {
    e.preventDefault();
    if (!heureDebut || !heureFin) {
      setAlertMessage("Veuillez remplir les heures de début et fin.");
      return;
    }
    if (timeToMinutes(heureFin) <= timeToMinutes(heureDebut)) {
      setAlertMessage("L'heure de fin doit être après l'heure de début.");
      return;
    }
    if (typeGeneral === "Scolaire" && !horaireMatiere) {
      setAlertMessage("Veuillez sélectionner une matière.");
      return;
    }
    if (typeGeneral === "Personnel" && !activitePerso.trim()) {
      setAlertMessage("Veuillez saisir le nom de l'activité personnelle.");
      return;
    }

    // Calcule la vraie date du jour sélectionné cette semaine
    const dateDuJour = addDays(dateLundi, jours.indexOf(jour));
    const dateISO = dateDuJour.toISOString().slice(0,10);

    const nouvelleSeance = {
      matiere: typeGeneral === "Scolaire" ? horaireMatiere : activitePerso.trim(),
      date: dateISO,
      jour,
      heureDebut,
      heureFin,
      typeSeance: typeGeneral === "Scolaire" ? typeSeance : "Personnel",
      typeGeneral,
    };

    if (chevauchement(nouvelleSeance, editIndex)) {
      setAlertMessage("Ce créneau chevauche une autre séance existante.");
      return;
    }

    const dureeSeance = timeToMinutes(heureFin) - timeToMinutes(heureDebut);
    const totalAvant = totalMinutesJour(dateISO, editIndex);
    if (totalAvant + dureeSeance > 24 * 60) {
      setAlertMessage("La durée totale des séances ce jour dépasse 24 heures.");
      return;
    }

    let nouvHoraires;
    if (editIndex !== null) {
      nouvHoraires = [...horaires];
      nouvHoraires[editIndex] = nouvelleSeance;
      setEditIndex(null);
    } else {
      nouvHoraires = [...horaires, nouvelleSeance];
    }
    setHoraires(nouvHoraires);

    setJour("Lundi");
    setHeureDebut("");
    setHeureFin("");
    setTypeSeance("Cours");
    setActivitePerso("");
    setTypeGeneral("Scolaire");
    setHoraireMatiere(matieres[0] || "");
    setAlertMessage("");
  };

  const supprimerHoraire = (index) => {
    const nouvHoraires = [...horaires];
    nouvHoraires.splice(index, 1);
    setHoraires(nouvHoraires);
    setEditIndex(null);
    setAlertMessage("");
  };

  const editerHoraire = (index) => {
    const h = horaires[index];
    setEditIndex(index);
    setJour(h.jour);
    setHeureDebut(h.heureDebut);
    setHeureFin(h.heureFin);
    setTypeGeneral(h.typeGeneral);
    if (h.typeGeneral === "Scolaire") {
      setHoraireMatiere(h.matiere);
      setTypeSeance(h.typeSeance);
      setActivitePerso("");
    } else {
      setActivitePerso(h.matiere);
      setHoraireMatiere("");
      setTypeSeance("Personnel");
    }
    setAlertMessage("");
  };

  // Génère la liste des dates de la semaine affichée
  const semaineDates = jours.map((_, idx) => addDays(dateLundi, idx));
  // Filtre les séances de la semaine courante (par date ISO)
  const horairesSemaine = horaires.filter(h =>
    semaineDates.some(d => d.toISOString().slice(0,10) === h.date)
  );
  // Trie les horaires par date, puis par heure
  const horairesParJour = semaineDates.reduce((acc, date, i) => {
    const dateISO = date.toISOString().slice(0,10);
    acc[dateISO] = horairesSemaine
      .filter(h => h.date === dateISO)
      .sort((a, b) => (a.heureDebut > b.heureDebut ? 1 : -1));
    return acc;
  }, {});

  return (
    <div style={{ maxWidth: 900, margin: "auto", padding: 20, fontFamily: "Arial, sans-serif" }}>
      <h1>Mon Plan Révisions</h1>
      {alertMessage && (
        <div
          style={{
            backgroundColor: "#f8d7da",
            color: "#842029",
            padding: 10,
            marginBottom: 15,
            borderRadius: 5,
          }}
        >
          {alertMessage}
        </div>
      )}

      {etape === 1 && (
        <>
          <h2>Étape 1 : Ajoutez vos matières</h2>
          <form onSubmit={ajouterMatiere} style={{ marginBottom: 10 }}>
            <input
              type="text"
              placeholder="Nom de la matière"
              value={nomMatiere}
              onChange={(e) => setNomMatiere(e.target.value)}
              required
              style={{ marginRight: 10 }}
              autoComplete="off"
              spellCheck={false}
            />
            <button type="submit">Ajouter matière</button>
          </form>
          <ul>
            {matieres.map((m, i) => (
              <li key={i}>{m}</li>
            ))}
          </ul>
          <button onClick={passerEtape2} disabled={matieres.length === 0}>
            Passer à l'ajout des horaires
          </button>
        </>
      )}

      {etape === 2 && (
        <>
          {/* Sélection de la semaine */}
          <div style={{ marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
            <select
              value={semaineIndex}
              onChange={e => setDateLundi(semaines[Number(e.target.value)].lundi)}
              style={{ fontWeight: "bold", fontSize: 16, padding: 5 }}
            >
              {semaines.map((s, i) => (
                <option key={i} value={i}>{s.label}</option>
              ))}
            </select>
            <button
              onClick={() => setDateLundi(getMonday(new Date()))}
              style={{ marginLeft: 10, background: "#1976d2", color: "#fff", padding: "5px 12px", border: "none", borderRadius: 4 }}
              disabled={semaineIndex === 0}
            >
              Revenir à cette semaine
            </button>
          </div>

          <h2>Étape 2 : Ajoutez vos horaires</h2>
          <form onSubmit={enregistrerHoraire} style={{ marginBottom: 10 }}>
            <select
              value={typeGeneral}
              onChange={(e) => setTypeGeneral(e.target.value)}
              style={{ marginRight: 10 }}
            >
              <option value="Scolaire">Scolaire</option>
              <option value="Personnel">Personnel</option>
            </select>
            {typeGeneral === "Scolaire" && (
              <select
                value={horaireMatiere}
                onChange={(e) => setHoraireMatiere(e.target.value)}
                style={{ marginRight: 10 }}
              >
                {matieres.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            )}
            {typeGeneral === "Personnel" && (
              <input
                type="text"
                placeholder="Nom de l'activité perso"
                value={activitePerso}
                onChange={(e) => setActivitePerso(e.target.value)}
                style={{ marginRight: 10 }}
                required
                autoComplete="off"
                spellCheck={false}
              />
            )}
            <select
              value={jour}
              onChange={(e) => setJour(e.target.value)}
              style={{ marginRight: 10 }}
            >
              {jours.map((j) => (
                <option key={j} value={j}>
                  {j}
                </option>
              ))}
            </select>
            <input
              type="time"
              value={heureDebut}
              onChange={(e) => setHeureDebut(e.target.value)}
              required
              style={{ marginRight: 10 }}
            />
            <input
              type="time"
              value={heureFin}
              onChange={(e) => setHeureFin(e.target.value)}
              required
              style={{ marginRight: 10 }}
            />
            {typeGeneral === "Scolaire" && (
              <select
                value={typeSeance}
                onChange={(e) => setTypeSeance(e.target.value)}
                style={{ marginRight: 10 }}
              >
                {["Cours", "TP", "TD"].map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            )}
            <button type="submit">{editIndex !== null ? "Modifier" : "Ajouter"} horaire</button>
            {editIndex !== null && (
              <button
                type="button"
                onClick={() => {
                  supprimerHoraire(editIndex);
                }}
                style={{ marginLeft: 10, backgroundColor: "#f44336", color: "#fff" }}
              >
                Supprimer
              </button>
            )}
          </form>

          <h3>Planning de la semaine</h3>
          <div style={{ display: "flex", gap: 15, overflowX: "auto" }}>
            {semaineDates.map((date, idx) => {
              const dateISO = date.toISOString().slice(0,10);
              return (
                <div
                  key={dateISO}
                  style={{
                    flex: "1 1 0",
                    border: "1px solid #ccc",
                    borderRadius: 5,
                    padding: 10,
                    minWidth: 140,
                    backgroundColor: "#f9f9f9",
                  }}
                >
                  <h4 style={{ textAlign: "center" }}>
                    {jours[idx]}<br />
                    <span style={{ fontSize: 13, color: "#555" }}>
                      {formatDateShort(date)}
                    </span>
                  </h4>
                  {horairesParJour[dateISO] && horairesParJour[dateISO].length > 0 ? (
                    horairesParJour[dateISO].map((h, i) => (
                      <div
                        key={i}
                        onClick={() => editerHoraire(horaires.findIndex(k => k === h))}
                        style={{
                          backgroundColor: h.typeGeneral === "Personnel" ? "#ffd" : "#c8e6c9",
                          marginBottom: 6,
                          padding: 6,
                          borderRadius: 4,
                          fontSize: 14,
                          cursor: "pointer",
                        }}
                        title="Cliquez pour modifier"
                      >
                        <strong>{h.matiere}</strong> <br />
                        {h.typeSeance} <br />
                        {h.heureDebut} - {h.heureFin}
                      </div>
                    ))
                  ) : (
                    <p style={{ fontStyle: "italic", color: "#888" }}>Aucune séance</p>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

export default App;

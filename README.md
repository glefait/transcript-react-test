# React or not React

# Contexte
UX dans le cadre d'un projet de gestion actionnable de transcription (speech-to-text), la transcription n'étant qu'une étape parmi d'autres (reconnaissance du speaker, modèle spécifique, chapitrage, génération de document final, ...)
Exemple : [PoC CTM](https://twitter.com/guillem_lefait/status/1639271825149419522)

```
BTW, c'est un projet pour lequel je recherche potentiellement des associés.
Une option possible est que le projet soit tout ou en partie open-source.

Intéressé par le projet ? Contactez-moi : guillem@datamq.com
```

La solution legacy (solution non présentée ici) est en JS natif : 
- structure de type arbre + liste chainée pour pouvoir insérer/déplacer facilement des "feuilles" (ou des branches) dans des branches précédentes/suivantes.
- conserve le maximum de relation entre les subwords et leurs timestamps (relatif à l'audio)

La structure se décompose en plusieurs niveaux :
``` 
- BLOCKS:
   - SPEAKER
   - LINES:
     - WORDS:
       - SUBWORDS: <text + timestamp + proba>
     - AJOUT: <text>
```

Volume : plusieurs centaines/milliers de blocks

## Objectifs

### Objectif métier
Pouvoir éditer/corriger une transcription générée automatiquement le plus rapidement possible, idéalement avec un 
facteur x1+ par rapport à la durée du media à transcrire.

La solution choisie est de :
- synchroniser le texte et l'audio/vidéo (au moins sur les éléments dont le timestamp est connu)
- pouvoir manipuler le DOM librement (correction / ajout de texte / ...) => seule façon à priori de conserver une rapidité pour se rapprocher du x1+
- avoir une indication visuelle sur les items/mots sur lesquels il y a un doute élevé
- pouvoir facilement faire absorber une ligne entière vers la ligne précédente (qu'elle appartienne au même block ou non)
- pouvoir facilement scinder une ligne en deux lignes
- pouvoir facilement scinder une ligne et créer un nouveau block

### Objectif archi
Vérifier si l'utilisation d'un framework de type React est pertinent lorsqu'on doit manipuler le DOM.

## Objectif technique
Tester React.

# REX

## 1. React pas adapté à une manipulation extérieure du DOM

Solutions identifiées :
- limiter les dépendances entre composants "feuilles" : fini le drag'n drop
- gérer le DOM des feuilles sans react. Ici, une feuille correspond à une "ligne".

## 2. Modifier une feuille avec un impact sur d'autres feuilles

Exemples : 
- je veux pouvoir déplacer la première ligne du speaker `Mme Lulz` dans le block du speaker précédent.
- je veux pouvoir déplacer le premier mot de la dernière ligne dans la ligne précédente (qui est dans un block précédent)
- je veux pouvoir couper la première ligne en deux lignes :
```
LIGNE QUE JE VEUX COUPER ICI XXX LE RESTE SERA SUR UNE NOUVELLE LIGNE
=>
LIGNE QUE JE VEUX COUPER ICI XXX
LE RESTE SERA SUR UNE NOUVELLE LIGNE
```
- Idem en coupant la première ligne et en créant un nouveau block qui contiendra la fin de la ligne coupée

Solutions ?
- contexte ?
- state ?
  - le state est alors dupliqué en partie ?


# TL;DR.
## Usage

`docker-compose up` et aller sur http://127.0.0.1:3000


### scripts

`node scripts/flatdata.js` produces a flat version of the nested `transcript-example.json`. 
The resulting file is stored in `public/data/`transcript-example-flat.json`

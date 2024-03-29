"use strict";

const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $searchForm = $("#searchForm");
const $episodesList = $("#episodesList");

const BASE_API_URL = 'http://api.tvmaze.com';
const DEFAULT_IMAGE = 'https://tinyurl.com/tv-missing';

/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(term) {
  // ADD: Remove placeholder & make request to TVMaze search shows API.
  const response = await axios.get
    (`${BASE_API_URL}/search/shows`,
      { params: { q: term } });

  //console.log("response=", response);


  return response.data.map(showAndScore => ({
    id: showAndScore.show.id,
    name: showAndScore.show.name,
    summary: showAndScore.show.summary,
    image: showAndScore.show.image ? showAndScore.show.image.medium : DEFAULT_IMAGE
  }));
};



//   return [
//     {
//       id: 1767,
//       name: "The Bletchley Circle",
//       summary:
//         `<p><b>The Bletchley Circle</b> follows the journey of four ordinary
//            women with extraordinary skills that helped to end World War II.</p>
//          <p>Set in 1952, Susan, Millie, Lucy and Jean have returned to their
//            normal lives, modestly setting aside the part they played in
//            producing crucial intelligence, which helped the Allies to victory
//            and shortened the war. When Susan discovers a hidden code behind an
//            unsolved murder she is met by skepticism from the police. She
//            quickly realises she can only begin to crack the murders and bring
//            the culprit to justice with her former friends.</p>`,
//       image:
//           "http://static.tvmaze.com/uploads/images/medium_portrait/147/369403.jpg"
//     }
//   ]
// }


/** Given list of shows, create markup for each and append to DOM.
 *
 * A show is {id, name, summary, image}
 * */

function displayShows(shows) {
  $showsList.empty();

  for (const show of shows) {
    const $show = $(`
        <div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img
              src="${show.image}"
              alt="${show.name} poster"
              class="w-25 me-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>
       </div>
      `);

    $showsList.append($show);
  }
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchShowsAndDisplay() {
  const term = $("#searchForm-term").val();
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  displayShows(shows);
}

$searchForm.on("submit", async function handleSearchForm(evt) {
  evt.preventDefault();
  await searchShowsAndDisplay();
});


/** getEpisodesOfShow: Given a show ID, get from API
 * return (promise) array of episodes: { id, name, season, number }
 */

async function getEpisodesOfShow(id) {
  const response = await axios.get(
    `${BASE_API_URL}/shows/${id}/episodes`
  );
  //console.log("response=", response);

  return response.data.map(episodes => ({
    id: episodes.id,
    name: episodes.name,
    season: episodes.season,
    number: episodes.number,
  }));

}

/** displayEpisodes: Clears the episodesList in the DOM, displays formatted
 * episode list in episodesArea of DOM. Accepts an array of episodes **/
//TODO:
function displayEpisode(episodes) {
  $episodesList.empty();

  for (const episode of episodes) {
    const $episode = $(`
      <li>${episode.name} (season ${episode.season},
      number ${episode.number})</li>
    `);
    $episodesList.append($episode);
  }
  //console.log($episodesList);

  $episodesArea.append($episodesList);
  $episodesArea.show();
}

/** getEpisodesAndDisplay: Gets list of episodes and calls
 * displayEpisode on that episode array
  */

async function getEpisodesAndDisplay(id) {
  const episodes = await getEpisodesOfShow(id);
  displayEpisode(episodes);
}

/** handleEpisodesButtonClick: Click handler gets id of target element,
 * Calls getEpisodesAndDisplay passing in target element id
  */

$showsList.on('click', 'button', function handleEpisodesButtonClick(evt) {
  const id = $(evt.target).closest("div.Show").data("showId");
  //console.log("id=", id);
  getEpisodesAndDisplay(id);
});

//await/async usually needed above - bring up bug to check-in
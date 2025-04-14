// Get the GitHub username input form
const gitHubForm = document.getElementById('gitHubForm');

// Listen for submissions on GitHub username input form
gitHubForm.addEventListener('submit', (e) => {
    const ul = document.getElementById('userRepos');
    ul.innerHTML = "";
    showLoading();

    // Prevent default form submission action
    e.preventDefault();

    // Get the GitHub username input field on the DOM
    let usernameInput = document.getElementById('usernameInput');
    let repoNameInput = document.getElementById('repoNameInput');

    // Get the value of the GitHub username input field
    let gitHubUsername = usernameInput.value;
    let repoName = repoNameInput.value;

    // Run GitHub API function, passing in the GitHub username
    requestUserRepos(gitHubUsername, repoName)
        .then(response => response.json()) // parse response into json
        .then(data => {
            hideLoading();
            if (!Array.isArray(data)) {
                data = [data];
            }
            for (let i in data) {
                // Create variable that will create li's to be added to ul
                let li = document.createElement('li');

                // Add Bootstrap list item class to each li
                li.classList.add('list-group-item')

                // Create the html markup for each li
                li.innerHTML = (`
                    <p><strong>Repo:</strong> ${data[i].name}</p>
                    <p><strong>Description:</strong> ${data[i].description}</p>
                    <p><strong>URL:</strong> <a href="${data[i].html_url}">${data[i].html_url}</a></p>
                    <p><strong>Commits:</strong></p>
                `);
                const commitsList = document.createElement("section");
                commitsList.classList.add("commitList");
                li.appendChild(commitsList);
                commits(gitHubUsername, data[i].name)
                    .then(r => r.json()
                    .then(json => {
                        for (commit of json) {
                            const commitItem = document.createElement("section");
                            commitItem.className = "commit bg-secondary-subtle text-secondary-emphasis rounded m-3 p-3";
                            commitItem.innerHTML = (`
                                <p><strong>Message:</strong> ${commit.commit.message}</p>
                                <p><strong>Author:</strong> ${commit.commit.committer.name} (<a href='mailto:${commit.commit.committer.email}'>${commit.commit.committer.email}</a>)</p>
                                <p><strong>Date:</strong> ${formatDate(new Date(commit.commit.author.date))}</p>
                            `)
                            commitsList.appendChild(commitItem);
                        }
                    })
                )
                // Append each li to the ul
                ul.appendChild(li);
            }
        })
})

const findButton = document.getElementById("findButton");

findButton.addEventListener("click", () => {
    updateReposOptions();
})

function getTimeAgo(date) {
    const time = new Date().getTime() - date.getTime();
    let amount;
    let unity;
    if (time >= 1000 * 60 * 60 * 24 * 30 * 12) {
        amount = parseInt(time / (1000 * 60 * 60 * 24 * 30 * 12));
        unity = "year";
    } else if (time >= 1000 * 60 * 60 * 24 * 30) {
        amount = parseInt(time / (1000 * 60 * 60 * 24 * 30));
        unity = "month";
    } else if (time >= 1000 * 60 * 60 * 24) {
        amount = parseInt(time / (1000 * 60 * 60 * 24));
        unity = "day";
    } else if (time >= 1000 * 60 * 60) {
        amount = parseInt(time / (1000 * 60 * 60)); 
        unity = "hour";
    } else {
        amount = parseInt(time / (1000 * 60)); 
        unity = "second";
    }
    return amount + " " + unity + (amount > 1 ? "s": "") + " ago";
}

function formatDate(date) {
    const formater = new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });

    return formater.format(date) + " (" + getTimeAgo(date) + ")";
}

function clearRepoNameOptions() {
    for (let option of document.querySelectorAll("option.repoOption")) {
        option.remove();
    }
}

function showLoading() {
    document.getElementById("loading").style.display = "";
}

function hideLoading() {
    document.getElementById("loading").style.display = "none";
}

async function  updateReposOptions() {
    const ul = document.getElementById('userRepos');
    ul.innerHTML = "";
    showLoading();
    const usernameInput = document.getElementById('usernameInput');   
    if (await userExists(usernameInput.value)) {
        document.getElementById("userNotFound").style.display = 'none';
        const repoNameInput = document.getElementById('repoNameInput');
        const repos = await getUserRepos(usernameInput.value);
        clearRepoNameOptions();
        for (let repo of repos) {
            const repoOption = document.createElement("OPTION");
            repoOption.innerHTML = repo.name;
            repoOption.classList.add("repoOption");
            repoNameInput.appendChild(repoOption);
        }
        document.getElementById("ShowRepos").style.display = 'flex';
    } else {
        document.getElementById("ShowRepos").style.display = 'none';
        document.getElementById("userNotFound").style.display = '';
    }
    hideLoading();
}

function requestUserRepos(username, repoName) {
    // create a variable to hold the `Promise` returned from `fetch`
    const options = {
        headers: {
            "Authorization": "Bearer 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"
        }
    }
    if (repoName != '') {
        return Promise.resolve(fetch(`https://api.github.com/repos/${username}/${repoName}`, options));
    } else {
        return Promise.resolve(fetch(`https://api.github.com/users/${username}/repos`, options));
    }
}

function commits(username, repoName) {
    // create a variable to hold the `Promise` returned from `fetch`
    const options = {
        headers: {
            "Authorization": "Bearer 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"
        }
    }
    return Promise.resolve(fetch(`https://api.github.com/repos/${username}/${repoName}/commits`, options));
}

async function userExists(username) {
    const options = {
        headers: {
            "Authorization": "Bearer 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"
        }
    }
    let repos;
    const response = await fetch(`https://api.github.com/users/${username}`, options);
    return response.status == 200;   
}

async function getUserRepos(username) {
    const options = {
        headers: {
            "Authorization": "Bearer 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"
        }
    }
    let repos;
    const response = await fetch(`https://api.github.com/users/${username}/repos`, options);
    return await response.json();
}

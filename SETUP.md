# Putting the site online (one-time setup)

Three free services, each doing one job:

- **GitHub** stores the site's files and keeps a history of every change.
- **Netlify** publishes those files as a website and resizes the photos.
- **Pages CMS** gives you (and the artist) a simple editor for projects, text and images.

Total time: about 30–45 minutes.

---

## 1. Put the files on GitHub

1. Create a free account at github.com.
2. Click **+** (top right) → **New repository**. Name it something like `portfolio`. Private is fine. Don't tick "Add a README". Click **Create repository**.
3. On the empty repository page, click **uploading an existing file**.
4. Unzip `portfolio-site.zip`. Open the folder, select **everything inside it** (not the folder itself) and drag it into the upload box. `index.html` must end up at the top level of the repository, not inside a subfolder.
5. Click **Commit changes**.

**Check for the hidden config file.** Your computer hides files starting with a dot, so `.pages.yml` may not have uploaded. In the repository's file list, look for `.pages.yml`. If it isn't there:

1. Click **Add file → Create new file**.
2. Name it exactly `.pages.yml`.
3. Open `pages-cms-config-copy.txt` from the zip, copy everything, paste it in, and commit.

(On a Mac, you can also press Cmd + Shift + . in Finder to show hidden files before dragging.)

## 2. Publish with Netlify

1. Go to netlify.com and sign up using **Sign up with GitHub**.
2. Choose **Add new project → Import an existing project → GitHub**, and allow Netlify to see your `portfolio` repository.
3. On the settings screen, leave **Build command** empty and set **Publish directory** to `.` (the `netlify.toml` file in the repo already says this).
4. Click **Deploy**. After a minute you'll get an address like `something-random.netlify.app`. Open it: the site is live, with flat placeholder blocks where photos will go.
5. Optional: under **Domain management**, rename the site (e.g. `margotlisle.netlify.app`) or connect a domain you own.

From now on, every change saved to GitHub is published automatically.

## 3. Connect the editor (Pages CMS)

1. Go to app.pagescms.org and sign in with GitHub.
2. When asked, install the Pages CMS GitHub app and give it access to the `portfolio` repository only.
3. Open the repository. You should see **Projects**, **Site details and Info page** and the media folders (**Images**, **Video**, **Files**).
4. Make a small test edit, for example change the city in **Site details**, and save. Refresh the Netlify site after a minute to see it change.

### Invite the artist

Pages CMS can invite collaborators by email, so she doesn't need a GitHub account. Use the collaborators/sharing option for the repository in Pages CMS and send the invitation to her address. Give her `HOW-TO-UPDATE.md`.

## 4. Replace the placeholder content

1. In **Site details**, change the name, city, email, Instagram, representation, bio, clients and press.
2. In **Projects**, edit or delete the ten sample projects and add hers.
3. In GitHub, open `index.html` and change the `<title>` and the `og:` lines in the head to her name. (The page title updates itself, but search engines read these first.)
4. Upload a 1200 × 630 image named `og.jpg` to **Images** for link previews.

## Keeping on with the design

The editor only touches `content/` and the media folders. The design lives in `styles.css`, `app.js` and `index.html`, so design changes and content edits never collide.

To change the design later, either:

- **Ask Claude with the repository connected.** With GitHub connected to Claude, share the repository name in a conversation and Claude can edit the design files and commit them directly. Netlify publishes each commit.
- **Or upload replacement files yourself.** Get the updated `styles.css` / `app.js` from Claude, then in GitHub use **Add file → Upload files**, drop them in, and commit. Files with the same name are replaced.

If a change ever goes wrong, Netlify's **Deploys** tab lets you republish any earlier version with one click.

## Previewing on your own computer (optional)

The site reads its content from files, so double-clicking `index.html` won't work. In a terminal, inside the folder, run `python3 -m http.server` and open http://localhost:8000.

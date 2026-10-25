# How to update the site

You edit the site at **your site's address + `/admin`**, for example `splendid-duckanoo-5ba3e1.netlify.app/admin`. Everything you save goes live on its own within a minute or two. You can't break the design from here; the worst that can happen is a typo, and you can fix it the same way.

## Sign in

1. Go to the `/admin` address.
2. Click **Sign In with GitHub** and approve the prompt. (The site owner can also use **Sign In Using Access Token**; see the bottom of this guide.) The browser remembers you, so you only do this once per computer.
3. On the left you'll see **Projects** and **Site details**. Uploaded images are under **Assets**.

## Add a project

1. Open **Projects → All projects**. Each project is a collapsed row; click one to open it, or use **Add Project** at the bottom for a new one.
2. Fill in the title, year, category and subcategory, client and your role. Creative direction projects are Commercial or Styling; Visual art projects are Collage, Photography, Sculpture or Paintings; films have no subcategory.
3. Write the **summary**: one short paragraph in the first person. What you did, for whom, when, with whom. Leave out adjectives about the work.
4. Under **Images**, add one entry for each photograph, in the order they should appear:
   - **Image:** upload the largest JPG you have. Around 3000px on the long side is plenty; keep files under about 10 MB. The site makes the smaller versions itself.
   - **Shape:** pick the closest (4:5, 3:2 and so on). If you get it slightly wrong, the site corrects it from the photo.
   - **Description for screen readers:** say plainly what's in the picture. This is required and it also helps Google.
   - **Caption:** usually leave it blank. The first image is captioned automatically as *Title, Client, Year*.
5. Add **Credits**: one line per person (role, then name).
6. Tick **Show on the cover** if this project should appear on the home page.
7. Click **Save** at the top.

The first image becomes the project's thumbnail in the Index and the Archive.

## Films

Add an image to use as the poster frame, then either:
- paste the **Vimeo link** (best for anything longer than a minute), or
- upload a short **MP4** under 50 MB as the **Video file**.

Films never play by themselves; visitors press play.

## Change the order

In **Projects**, drag entries up or down. The site groups projects by category and subcategory; inside each group it keeps the order you set here. The Index numbers (01, 02, 03…) follow the grouped order.

## Choose what's on the home page

- The big photograph beside your name comes from the **first** project ticked **Show on the cover**. The site uses that project's first upright image.
- The sequence below it uses the first image of each ticked project, up to six.

To change the big photograph, drag a different ticked project to the top, or untick projects above it.

## Edit your bio, contact details, clients and press

Open **Site details**. In the longer bio, leave a blank line between paragraphs. To add your CV, upload a PDF in the **CV** field; until then the site says "CV on request".

## Remove a project

Open **Projects → All projects**, use the delete button on that project's row, then **Save**. Images you uploaded stay under **Assets** until you delete them there too.

## Good habits

- Name image files sensibly before uploading (`lent-01.jpg`, not `IMG_4821.jpg`). The names show up in the media library.
- Export JPGs in sRGB so colours look the same in every browser.
- If something looks wrong after saving, wait two minutes and refresh. If it still looks wrong, undo your last change and save again.

## Categories

The site is organised in three parts:

- **I Creative direction:** Commercial, Styling
- **II Film costuming:** one entry per film
- **III Visual art:** Collage, Photography, Sculpture, Paintings

Each project has one category and, except for films, one subcategory. Each collage series, for example, is its own project with Category: Visual art and Subcategory: Collage. Parts and subheadings with nothing in them don't appear on the site.

Every part and subcategory has its own link you can send people, for example `yoursite/#visual-art`, `yoursite/#collage` or `yoursite/#film-costuming`. It opens the Index showing just that part.

Adding a new category or subcategory (say, Printmaking) needs a small change to the editor settings, so ask whoever maintains the site.

## Getting an access key (site owner only)

If **Sign In with GitHub** isn't set up yet, the owner of the `lily` repository can sign in with a key instead. This only works for the account that owns the repository; collaborators need **Sign In with GitHub**.

1. On github.com: profile picture → **Settings** → **Developer settings** (bottom of the left sidebar) → **Personal access tokens** → **Fine-grained tokens** → **Generate new token**.
2. Name it "Site editor" and set an expiry (a year is fine; you'll need a new key after that).
3. **Repository access:** *Only select repositories* → `lily`.
4. **Permissions → Repository permissions → Contents:** *Read and write*.
5. **Generate token**, copy it, and paste it into **Sign In Using Access Token** on the `/admin` page.

Treat the key like a password: don't email it or post it anywhere. If it ever leaks, delete it on the same GitHub page and make a new one.

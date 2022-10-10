import { verifyUserAuth } from "../hooks/user-auth";

const blogRouters = async (app) => {
  app.post(
    "/",
    {
      preHandler: [
        verifyUserAuth,
        app.upload.fields([{ name: "blogs", maxCount: 3 }]),
      ],
    },
    createBlog
  );
  app.get("/:id", getBlogById);
  app.get("/", getBlogList);
  app.delete("/:id", deleteBlogById);
};

async function createBlog(req) {
  return await this.blogHandlers.createBlog(req.user, req.body, req.files);
}

async function getBlogById(req) {
  return await this.blogHandlers.getBlogById(req.params);
}

async function getBlogList() {
  return await this.blogHandlers.getBlogList();
}

async function deleteBlogById(req) {
  return await this.blogHandlers.deleteBlogById(req.params);
}

export default blogRouters;

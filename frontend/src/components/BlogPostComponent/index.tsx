import { IComment, postInterface } from "../../redux/types/post";
import {
  
    BlogPostComponentContainer,

    Content,
    ContentContainer,
    ImageContainer,
    Img,

    TextContainer,
    Title,
    TitleContainer,
    Information,
   
    CommentsContainer,
    UnderTitle,
    ButtonsContainer,
   
    EditContent,
    SubmitPost,
    FormContent,
    ErrorMessage,
    AddCommentTextContainer,
    AddCommentText,
} from "./BlogPostComponents";
import Comment from "./Comment";
import React, { useState } from "react";
import AddComment from "./AddComment";
import api, { ICall, IResult } from "../../utils/api";
import { useDispatch, useSelector } from "react-redux";
import { getPost } from "../../redux/slices/post";
import { RootState } from "../..";
import { Link } from "react-router-dom";
import handleAxiosError from "../../utils/handleAxiosError";

const BlogPostComponent: React.FC<postInterface> = ({
    imageURL,
    title,
    content,
    
   
    
    comments,
    _id,
    slug,
}) => {
    

    const [addCommentValue, setAddCommentValue] = useState("");
    const [call, setCall] = useState<ICall>({ status: "idle", error: null, result: null });
    const setValue = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setAddCommentValue(e.target.value);
    };
    const auth = useSelector((state: RootState) => state.auth);
    const dispatch = useDispatch();
    const handleSubmit = (e: React.MouseEvent) => {
        e.preventDefault();
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        api.post<IResult>("/post/add-comment", { content: addCommentValue, id: _id })
            .then((result) => {
                setCall({ status: "success", result: result.data, error: null });
                dispatch(getPost(slug));
            })
            .catch((error: Error) => {
                const err = handleAxiosError(error);
                //handled by axios interceptor
                if (err === "return") return;
                setCall({ status: "failed", result: null, error: err });
            });
    };
   
    const [editMode, setEditMode] = useState(false);
    const [editedContent, setEditedContent] = useState("");
   
    const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setEditedContent(e.target.value);
    };
    const [updatePostCall, setUpdatePostCall] = useState<ICall>({ status: "idle", error: null, result: null });
    const handlePostChanges = (e: React.FormEvent) => {
        e.preventDefault();
        api.put<IResult>("/post/update-post", { id: _id, content: editedContent })
            .then((result) => {
                setUpdatePostCall({ status: "success", result: result.data, error: null });
                setEditMode(false);
                dispatch(getPost(slug));
            })
            .catch((error: Error) => {
                const err = handleAxiosError(error);
                //handled by axios interceptor
                if (err === "return") return;
                setUpdatePostCall({ status: "failed", result: null, error: err });
            });
    };
    return (
        <BlogPostComponentContainer>
            <ImageContainer>
                <Img src={imageURL} alt={title} height="400" width="1500" />
            </ImageContainer>

            <TextContainer>
                <TitleContainer>
                    <Title>{title}</Title>
                </TitleContainer>
                <UnderTitle>
                    <ButtonsContainer>
                       
                    </ButtonsContainer>
                    <Information>
                       
                    </Information>
                </UnderTitle>

                <ContentContainer>
                    {!editMode && <Content>{content}</Content>}
                    {editMode && (
                        <>
                            <FormContent onSubmit={handlePostChanges}>
                                {updatePostCall.status === "failed" && (
                                    <ErrorMessage>{updatePostCall.error}</ErrorMessage>
                                )}
                                <EditContent value={editedContent} onChange={handleContentChange} />
                                <SubmitPost>Submit changes</SubmitPost>
                            </FormContent>
                        </>
                    )}
                </ContentContainer>
            </TextContainer>

            <CommentsContainer>
                {auth.status === "failed" && (
                    <AddCommentTextContainer>
                        <AddCommentText>
                            Please <Link to="/login">login</Link> or <Link to="/register">register</Link> in order to
                            leave a comment
                        </AddCommentText>
                    </AddCommentTextContainer>
                )}
                {auth.status === "success" && (
                    <AddComment
                        setValue={setValue}
                        handleSubmit={handleSubmit}
                        message={call.result?.message}
                        error={
                            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                            call.error
                        }
                    />
                )}

                {comments.map((comment: IComment) => (
                    <Comment
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                        key={comment._id}
                        {...comment}
                        slug={slug}
                        postId={_id}
                    />
                ))}
            </CommentsContainer>
        </BlogPostComponentContainer>
    );
};

export default BlogPostComponent;

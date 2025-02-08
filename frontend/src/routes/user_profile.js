import { Box, Text, VStack, Flex, Heading, HStack, Button, Image, Spacer } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { get_user_profile_data, get_users_posts, toggleFollow } from '../api/endpoints';
import { SERVER_URL } from '../constants/constants';
import Post from '../components/post';
import { useNavigate } from 'react-router-dom';

const UserProfile = () => {
    const get_username_from_url = () => {
        const url_split = window.location.pathname.split('/');
        return url_split[url_split.length - 1];
    };

    const [username, setUsername] = useState(get_username_from_url());

    useEffect(() => {
        setUsername(get_username_from_url());
    }, []);

    return (
        <Flex w="100%" justifyContent="center" pt="10vh">
            <VStack w="75%">
                <Box width="100%" mt="40px">
                    <UserDetails username={username} />
                </Box>
                <Box width="100%" mt="30px">
                    <UserPosts username={username} />
                </Box>
            </VStack>
        </Flex>
    );
};

const UserDetails = ({ username }) => {
    const [loading, setLoading] = useState(true);
    const [bio, setBio] = useState('');
    const [profileImage, setProfileImage] = useState('');
    const [followerCount, setFollowerCount] = useState(0);
    const [followingCount, setFollowingCount] = useState(0);
    const [isOurProfile, setIsOurProfile] = useState(false);
    const [following, setFollowing] = useState(false);
    const navigate = useNavigate();

    const handleToggleFollow = async () => {
        const data = await toggleFollow(username);
        if (data.now_following) {
            setFollowerCount(followerCount + 1);
            setFollowing(true);
        } else {
            setFollowerCount(followerCount - 1);
            setFollowing(false);
        }
    };

    const handleEditProfile = () => {
        navigate('/settings');
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await get_user_profile_data(username);
                setBio(data.bio);
                setProfileImage(data.profile_image);
                setFollowerCount(data.follower_count);
                setFollowingCount(data.following_count);
                setIsOurProfile(data.is_our_profile);
                setFollowing(data.following);
            } catch {
                alert({ error: 'error in get user profile data' });
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [username]);

    return (
        <VStack width="100%" alignItems="start" gap="20px">
            <Heading>@{username}</Heading>
            <HStack gap="20px">
                <Box boxSize="150px" border="2px Solid grey.700" bg="white" borderRadius="full" overflow="hidden">
                    <Image src={`${SERVER_URL}${profileImage}`} boxSize="100%" objectFit="cover" />
                </Box>
                <VStack gap="20px">
                    <HStack gap="20" fontSize="18px">
                        <VStack>
                            <Text>Followers</Text>
                            <Text>{loading ? '-' : followerCount}</Text>
                        </VStack>
                        <VStack>
                            <Text>Following</Text>
                            <Text>{loading ? '-' : followingCount}</Text>
                        </VStack>
                    </HStack>
                    {loading ? (
                        <Spacer />
                    ) : isOurProfile ? (
                        <Button w="100%" onClick={handleEditProfile}>
                            Edit Profile
                        </Button>
                    ) : (
                        <Button onClick={handleToggleFollow} colorScheme="blue" w="100%">
                            {following ? 'Unfollow' : 'Follow'}
                        </Button>
                    )}
                </VStack>
            </HStack>
            <Text>{loading ? '-' : bio}</Text>
        </VStack>
    );
};

const UserPosts = ({ username }) => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const posts = await get_users_posts(username);
                setPosts(posts);
            } catch {
                alert('error getting user posts');
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, [username]);

    return (
        <Flex w="100%" wrap="wrap" gap="20px" pb="50px">
            {loading ? (
                <Text>Loading...</Text>
            ) : (
                posts.map((post) => (
                    <Post
                        key={post.id}
                        id={post.id}
                        username={post.username}
                        description={post.description}
                        formatted_date={post.formatted_date}
                        liked={post.liked}
                        like_count={post.like_count}
                        image_url={post.image_url} // Pass image_url to Post component
                    />
                ))
            )}
        </Flex>
    );
};

export default UserProfile;
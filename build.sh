set -e

CI_COMMIT_SHA=$(git rev-parse HEAD)
echo $CI_COMMIT_SHA
IMAGE_NAME="dex"

DOCKER_IMAGE="harbor.soneuro-handmade.com/infra/$IMAGE_NAME:$CI_COMMIT_SHA"
DOCKER_IMAGE_V2="harbor.soneuro-handmade.com/infra/$IMAGE_NAME:main"


# docker image build

docker build --platform linux/amd64  -t $DOCKER_IMAGE -t $DOCKER_IMAGE_V2 . --build-arg GIT_SHA=$CI_COMMIT_SHA

# docker image push
echo $HARBOR_PW | docker login -u $HARBOR_ID --password-stdin harbor.soneuro-handmade.com

docker push $DOCKER_IMAGE
docker push $DOCKER_IMAGE_V2
docker rmi $DOCKER_IMAGE
docker rmi $DOCKER_IMAGE_V2

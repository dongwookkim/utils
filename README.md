

# docker

```sh

docker pull <image>
docker save -o <image.tar> <image>

# 100m 가 보다 큰파일 경우는 파일쪼개기
# split -b 10m zeebe-latest.tar zeebe-latest.tar.

```




# zeebe


- 이미지 파일 합치기

```sh

cd docker-images/zeebe
cat zeebe-latest.tar.* > zeebe-latest.tar

# 이미지 분리
# split -b 10m zeebe-latest.tar zeebe-latest.tar.

```
## Video Editor

### 실행 방법
1. 서버 실행 순서.
   1. 실행 전 **ffmpeg**를 로컬 환경에 설치해준다.
   ```shell
    $ brew install ffmpeg
    ```
   2. 그 후 아래와 같이 터미널에서 명령어를 입력해 패키지를 설치해주고, 서버를 실행합니다.
   (서버 포트 = 8080)
   ```shell
    $ yarn install
    $ yarn start
    ```

## API 문서 접속
`localhost:8080/api`로 접속 시 모든 API에 대한 문서를 확인할 수 있다.
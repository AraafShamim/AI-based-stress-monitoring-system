FROM eclipse-temurin:21-jdk-alpine

WORKDIR /app

COPY pom.xml .
COPY .mvn .mvn
COPY src src

RUN apk add --no-cache maven && \
    mvn clean package -DskipTests && \
    mv target/stress-monitoring-*.jar app.jar && \
    apk del maven

EXPOSE 8080

ENTRYPOINT ["sh", "-c", "java -jar app.jar --server.port=${PORT:-8080}"]

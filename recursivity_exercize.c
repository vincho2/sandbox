#include <stdio.h>
#include <stdlib.h>

int max(int x, int y);

// expect 1 single argument which is the input
int main(int argc, char *argv[]) {

    if (argv[1] < 0) return 1;
    int input = atoi(argv[1]);
    int output;

    // Loop on each row and column of the output array
    for (int i = 0; i < 2 * input - 1; i++) {

        for (int j = 0; j < 2 * input - 1; j++) {

            // Each array value is the max x or y distance from the centre 
            output = max(abs(i + 1 - input), abs(j + 1 -input)) + 1;
            printf("%i", output);
        }
        printf("\n");
    }
    return 0;
}

int max(int x, int y) {
    return (x > y) ? x : y;
}
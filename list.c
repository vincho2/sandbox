#include <stdio.h>
#include <stdlib.h>

typedef struct node
{
    int number;
    struct node *next;
} node;

int main(void)
{
    node *list = NULL;
    
    for (int i = 0; i < 3; i++)
    {
        node *n = malloc(sizeof(node));
        if (n == NULL)
        {
            return 1;
        }

        n->number = i;
        n->next = list;
        list = n;
        free(n);
    }
    
    node *n = malloc(sizeof(node));
    n = list;

    while (n != NULL)
    {
        printf("%i\n", n->number);
        n = n->next;
    }
    free(n);
}